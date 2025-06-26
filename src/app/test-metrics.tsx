'use client';

import { useState, useEffect } from 'react';

export default function TestMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log('TestMetrics: Iniciando petición...');
        const response = await fetch('http://localhost:8080/api/broker/metrics');
        console.log('TestMetrics: Respuesta:', response.status, response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('TestMetrics: Datos recibidos:', data);
        setMetrics(data);
      } catch (err) {
        console.error('TestMetrics: Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div>Cargando métricas de prueba...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold">🧪 PRUEBA DE MÉTRICAS</h3>
      <pre className="text-xs mt-2 bg-white p-2 rounded">
        {JSON.stringify(metrics, null, 2)}
      </pre>
      <div className="mt-2 flex gap-4">
        <span>CPU: {metrics?.cpuUsage ? (metrics.cpuUsage * 100).toFixed(1) : 'N/A'}%</span>
        <span>RAM: {metrics?.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(0) : 'N/A'}MB</span>
        <span>Uptime: {metrics?.uptimeFormatted || 'N/A'}</span>
      </div>
    </div>
  );
}
