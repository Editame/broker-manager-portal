import { useState, useEffect, useCallback } from 'react';

export interface BrokerMetrics {
  brokerId: string;
  brokerName: string;
  brokerVersion: string;
  cpuUsage: number;
  memoryUsage: number;
  maxMemory: number;
  memoryUsagePercentage: number;
  totalConnections: number;
  activeConnections: number;
  totalThreads: number;
  diskUsage: number;
  maxDiskUsage: number;
  diskUsagePercentage: number;
  startTime: string;
  uptimeMillis: number;
  uptimeFormatted: string;
  status: string;
  timestamp: string;
}

export function useBrokerMetrics(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<BrokerMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/broker/metrics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching broker metrics:', err);
      setError('No se pudieron obtener las métricas del broker');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      fetchMetrics();
      
      // Actualizar métricas cada 30 segundos
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, enabled]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}
