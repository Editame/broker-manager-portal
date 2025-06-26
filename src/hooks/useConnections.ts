import { useState, useEffect, useCallback, useRef } from 'react';
import { BrokerConnection } from '@/types/connection';

export function useConnections() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<BrokerConnection | null>(null);
  const [isUserConnected, setIsUserConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  
  // Ref para evitar peticiones duplicadas
  const fetchingRef = useRef(false);

  const fetchConnections = useCallback(async () => {
    // Evitar peticiones duplicadas
    if (fetchingRef.current) {
      console.log('fetchConnections: Petición ya en curso, saltando...');
      return;
    }
    
    try {
      console.log('fetchConnections: Iniciando petición...');
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/connections');
      console.log('fetchConnections: Respuesta recibida', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('fetchConnections: Datos recibidos', data.length, 'conexiones');
      setConnections(data);
      
      // Encontrar conexión activa y establecer isUserConnected automáticamente
      const active = data.find((conn: BrokerConnection) => conn.active);
      console.log('fetchConnections: Conexión activa encontrada:', active?.name || 'ninguna');
      setActiveConnection(active || null);
      
      // Si hay conexión activa, el usuario está conectado
      if (active) {
        console.log('fetchConnections: Estableciendo isUserConnected = true');
        setIsUserConnected(true);
      } else {
        console.log('fetchConnections: No hay conexión activa, isUserConnected = false');
        setIsUserConnected(false);
      }
      
    } catch (err) {
      console.error('fetchConnections: Error:', err);
      setError('No se pudieron obtener las conexiones');
      setIsUserConnected(false);
      setActiveConnection(null);
    } finally {
      console.log('fetchConnections: Finalizando...');
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const connectToConnection = useCallback(async (connectionId: string) => {
    try {
      setConnectionMessage(null);
      
      // Usar la función de activación corregida
      await activateConnection(connectionId);
      
      // Refrescar la lista de conexiones para obtener el estado actualizado
      await fetchConnections();
      
      setConnectionMessage('Conexión establecida exitosamente');
      console.log(`✅ Conectado exitosamente a la conexión: ${connectionId}`);
    } catch (err) {
      console.error('Error connecting to broker:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setConnectionMessage(`Error al conectar: ${errorMessage}`);
      throw err;
    }
  }, [fetchConnections]);

  const disconnect = useCallback(async () => {
    try {
      setConnectionMessage(null);
      
      // Desactivar todas las conexiones en el backend
      const response = await fetch('http://localhost:8080/api/connections/disconnect', {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Actualizar estado local
      setActiveConnection(null);
      setIsUserConnected(false);
      
      // Refrescar la lista de conexiones
      await fetchConnections();
      
      setConnectionMessage('Desconectado exitosamente');
    } catch (err) {
      console.error('Error disconnecting:', err);
      setConnectionMessage('Error al desconectar');
    }
  }, [fetchConnections]);

  const clearConnectionMessage = useCallback(() => {
    setConnectionMessage(null);
  }, []);

  // Cargar conexiones al montar el componente
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    activeConnection,
    isUserConnected,
    loading,
    error,
    connectionMessage,
    connectToConnection,
    disconnect,
    clearConnectionMessage,
    refetch: fetchConnections
  };
}
