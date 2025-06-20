import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (enabled) {
      loadQueues();
    }
  }, [loadQueues, enabled]);

  return {
    queues,
    loading,
    error,
    refetch: loadQueues,
  };
}
