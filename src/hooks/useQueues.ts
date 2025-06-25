import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueueInfo } from '@/types/queue';
import { LoadingState } from '@/types/common';
import { fetchQueues } from '@/lib/api/service';

export function useQueues(enabled: boolean = true) {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [{ loading, error }, setLoadingState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const loadQueues = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoadingState({ loading: true, error: null });
      const queueData = await fetchQueues();
      setQueues(queueData);
    } catch (err) {
      setLoadingState({ 
        loading: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      });
      return;
    }
    setLoadingState({ loading: false, error: null });
  }, [enabled]);

  // Cargar colas solo una vez al inicio, sin intervalo automático
  useEffect(() => {
    if (enabled) {
      loadQueues();
    }
  }, [enabled, loadQueues]);

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
