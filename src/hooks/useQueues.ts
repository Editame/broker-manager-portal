import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueueInfo } from '@/types/queue';
import { LoadingState } from '@/types/common';
import { fetchQueues } from '@/lib/api/service';

export function useQueues(connectionId: string | null, isActive: boolean = false) {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [{ loading, error }, setLoadingState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const loadQueues = useCallback(async () => {
    // Si no hay conexión o no está activa, limpiar datos y no hacer peticiones
    if (!connectionId || !isActive) {
      console.log('🚫 No hay conexión activa o broker no disponible - limpiando colas');
      setQueues([]);
      setLoadingState({ 
        loading: false, 
        error: !connectionId ? 'No hay conexión seleccionada' : 'Broker no disponible'
      });
      return;
    }
    
    try {
      console.log(`📋 Obteniendo colas para conexión: ${connectionId}`);
      setLoadingState({ loading: true, error: null });
      
      // Hacer petición específica a la conexión activa
      const response = await fetch(`http://localhost:8080/api/queues?connectionId=${connectionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const queueData = await response.json();
      console.log(`✅ ${queueData.length} colas obtenidas`);
      setQueues(queueData);
    } catch (err) {
      console.error('❌ Error fetching queues:', err);
      setLoadingState({ 
        loading: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      });
      setQueues([]); // Limpiar colas en caso de error
      return;
    }
    setLoadingState({ loading: false, error: null });
  }, [connectionId, isActive]);

  // Cargar colas cuando cambia la conexión o el estado activo
  useEffect(() => {
    loadQueues();
  }, [loadQueues, connectionId, isActive]);

  const queueStats = useMemo(() => {
    if (!queues.length) return { total: 0, withMessages: 0, withConsumers: 0 };
    
    return {
      total: queues.length,
      withMessages: queues.filter(q => q.queueSize > 0).length,
      withConsumers: queues.filter(q => q.consumerCount > 0).length,
    };
  }, [queues]);

  return {
    queues,
    loading,
    error,
    refetch: loadQueues,
    stats: queueStats,
  };
}
