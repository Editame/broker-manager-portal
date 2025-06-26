import { useState, useEffect, useCallback } from 'react';

interface ConnectivityState {
  isConnected: boolean;
  isChecking: boolean;
  error: string | null;
  lastCheck: Date | null;
}

export function useBrokerConnectivity(activeConnectionId: string | null) {
  const [connectivity, setConnectivity] = useState<ConnectivityState>({
    isConnected: false,
    isChecking: false,
    error: null,
    lastCheck: null
  });

  const checkConnectivity = useCallback(async () => {
    if (!activeConnectionId) {
      setConnectivity({
        isConnected: false,
        isChecking: false,
        error: 'No hay conexión activa',
        lastCheck: new Date()
      });
      return;
    }

    try {
      setConnectivity(prev => ({ ...prev, isChecking: true, error: null }));
      
      // Verificar conectividad real probando las métricas
      const response = await fetch('http://localhost:8080/api/broker/metrics');
      
      if (response.ok) {
        const data = await response.json();
        // Si obtenemos métricas válidas, la conexión está activa
        setConnectivity({
          isConnected: true,
          isChecking: false,
          error: null,
          lastCheck: new Date()
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Connectivity check failed:', error);
      setConnectivity({
        isConnected: false,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Error de conectividad',
        lastCheck: new Date()
      });
    }
  }, [activeConnectionId]);

  // Verificar conectividad cuando cambia la conexión activa
  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  // Verificar conectividad cada 30 segundos
  useEffect(() => {
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  return {
    ...connectivity,
    recheckConnectivity: checkConnectivity
  };
}
