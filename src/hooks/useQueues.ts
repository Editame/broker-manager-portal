import { useState, useEffect, useCallback } from 'react';
import { QueueInfo } from '@/types/queue';
import { LoadingState } from '@/types/common';
import { fetchQueues } from '@/lib/api/service';

export function useQueues() {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [{ loading, error }, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null,
  });

  const loadQueues = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  return {
    queues,
    loading,
    error,
    refetch: loadQueues,
  };
}
