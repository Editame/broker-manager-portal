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
    if (fetchingRef.current) return;
    
    try {
      console.log('fetchConnections: Iniciando petición...');
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/connections');
      console.log('fetchConnections: Respuesta recibida', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('fetchConnections: Datos recibidos', data);
      setConnections(data);
      
      // Encontrar conexión activa y establecer isUserConnected automáticamente
      const active = data.find((conn: BrokerConnection) => conn.active);
      console.log('fetchConnections: Conexión activa', active);
      setActiveConnection(active || null);
      
      // Si hay conexión activa, el usuario está conectado
      if (active) {
        console.log('fetchConnections: Usuario conectado automáticamente');
        setIsUserConnected(true);
      }
      
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('No se pudieron obtener las conexiones');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const connectToConnection = useCallback(async (connectionId: string) => {
    try {
      setConnectionMessage(null);
      
      // Activar la conexión en el backend
      const response = await fetch(`http://localhost:8080/api/connections/${connectionId}/activate`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error(`Error al activar conexión: ${response.status}`);
      }
      
      const activatedConnection = await response.json();
      
      // Actualizar estados - SOLO cuando el usuario se conecta manualmente
      setActiveConnection(activatedConnection);
      setIsUserConnected(true);
      setConnectionMessage(`✅ Conectado exitosamente a "${activatedConnection.name}"`);
      
      // Refrescar lista de conexiones
      await fetchConnections();
      
      return activatedConnection;
    } catch (err) {
      console.error('Error connecting to broker:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al conectar';
      setError(errorMsg);
      throw err;
    }
  }, [fetchConnections]);

  const disconnect = useCallback(() => {
    setIsUserConnected(false);
    setConnectionMessage('🔌 Desconectado del broker');
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setConnectionMessage(null), 3000);
  }, []);

  const clearConnectionMessage = useCallback(() => {
    setConnectionMessage(null);
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
    console.log('useConnections: Cargando conexiones...');
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    activeConnection,
    isUserConnected,
    loading,
    error,
    connectionMessage,
    refetch: fetchConnections,
    connectToConnection,
    disconnect,
    clearConnectionMessage
  };
}
