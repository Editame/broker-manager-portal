import { useState, useCallback } from 'react';
import { Message } from '@/types/message';
import { LoadingState } from '@/types/common';
import { fetchMessages } from '@/lib/api/service';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [{ loading, error }, setLoadingState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const loadMessages = useCallback(async (queueName: string) => {
    try {
      setLoadingState({ loading: true, error: null });
      const messageData = await fetchMessages(queueName);
      setMessages(messageData);
    } catch (err) {
      setLoadingState({ 
        loading: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      });
      return;
    }
    setLoadingState({ loading: false, error: null });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLoadingState({ loading: false, error: null });
  }, []);

  return {
    messages,
    loading,
    error,
    loadMessages,
    clearMessages,
  };
}
