import { useState, useEffect, useCallback } from 'react';
import { BrokerConnection } from '@/types/connection';

export function useConnections() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<BrokerConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/connections');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setConnections(data);
      
      // Encontrar la conexión activa
      const active = data.find((conn: BrokerConnection) => conn.active);
      setActiveConnection(active || null);
      
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('No se pudieron obtener las conexiones');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveConnection = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/connections/active');
      if (response.ok) {
        const data = await response.json();
        setActiveConnection(data);
      } else {
        setActiveConnection(null);
      }
    } catch (err) {
      console.error('Error fetching active connection:', err);
      setActiveConnection(null);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    activeConnection,
    loading,
    error,
    refetch: fetchConnections,
    refetchActive: fetchActiveConnection
  };
}
