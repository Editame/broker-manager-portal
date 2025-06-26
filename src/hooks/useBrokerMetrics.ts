import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, buildApiUrlWithConnection } from '@/lib/config/api';

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

export function useBrokerMetrics(connectionId: string | null, isActive: boolean = false) {
  const [metrics, setMetrics] = useState<BrokerMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    // Si no hay conexión o no está activa, limpiar datos y no hacer peticiones
    if (!connectionId || !isActive) {
      console.log('🚫 No hay conexión activa o broker no disponible - limpiando métricas');
      setMetrics(null);
      setLoading(false);
      setError(!connectionId ? 'No hay conexión seleccionada' : 'Broker no disponible');
      return;
    }
    
    try {
      console.log(`📊 Obteniendo métricas para conexión: ${connectionId}`);
      setLoading(true);
      setError(null);
      
      // Hacer petición específica a la conexión activa
      const response = await fetch(buildApiUrlWithConnection(API_CONFIG.ENDPOINTS.BROKER_METRICS, connectionId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Métricas obtenidas para ${data.brokerName}`);
      setMetrics(data);
    } catch (err) {
      console.error('❌ Error fetching broker metrics:', err);
      setError('No se pudieron obtener las métricas del broker');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [connectionId, isActive]);

  useEffect(() => {
    fetchMetrics();
    
    if (connectionId && isActive) {
      // Actualizar métricas cada 30 segundos solo si hay conexión activa
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, connectionId, isActive]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}
