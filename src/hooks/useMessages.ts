import { useState, useCallback, useRef, useMemo } from 'react';
import { Message } from '@/types/message';
import { LoadingState } from '@/types/common';
import { fetchMessages } from '@/lib/api/service';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [{ loading, error }, setLoadingState] = useState<LoadingState>({
    loading: false,
    error: null,
  });
  
  // Control de frecuencia para evitar spam de peticiones
  const lastFetchRef = useRef<{ queueName: string; timestamp: number } | null>(null);
  const FETCH_COOLDOWN = 500; // Reducido a 500ms para mejor respuesta

  const loadMessages = useCallback(async (queueName: string) => {
    // Control de frecuencia - evitar peticiones muy frecuentes a la misma cola
    const now = Date.now();
    if (lastFetchRef.current && 
        lastFetchRef.current.queueName === queueName && 
        now - lastFetchRef.current.timestamp < FETCH_COOLDOWN) {
      console.log(`Skipping fetch for ${queueName} - too frequent`);
      return;
    }

    console.log(`🚀 Starting message fetch for queue: ${queueName} at ${new Date().toISOString()}`);
    const startTime = performance.now();

    try {
      setLoadingState({ loading: true, error: null });
      const messageData = await fetchMessages(queueName);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`✅ Message fetch completed for ${queueName} in ${duration.toFixed(2)}ms`);
      console.log(`📊 Retrieved ${messageData.length} messages`);
      
      setMessages(messageData);
      
      // Actualizar timestamp de última petición
      lastFetchRef.current = { queueName, timestamp: now };
      
    } catch (err) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ Message fetch failed for ${queueName} after ${duration.toFixed(2)}ms:`, err);
      
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
    lastFetchRef.current = null;
  }, []);

  // Memoizar estadísticas de mensajes
  const messageStats = useMemo(() => {
    if (!messages.length) return { total: 0, byPriority: {} };
    
    const byPriority = messages.reduce((acc, msg) => {
      const priority = msg.priority || 0;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total: messages.length,
      byPriority,
    };
  }, [messages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    clearMessages,
    stats: messageStats,
  };
}
