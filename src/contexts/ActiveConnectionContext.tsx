'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrokerConnection } from '@/types/connection';
import { getAllConnections } from '@/lib/api/connections';

interface ActiveConnectionContextType {
  activeConnection: BrokerConnection | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  setActiveConnection: (connection: BrokerConnection | null) => void;
  refreshActiveConnection: () => Promise<void>;
}

const ActiveConnectionContext = createContext<ActiveConnectionContextType | undefined>(undefined);

interface ActiveConnectionProviderProps {
  children: ReactNode;
}

export function ActiveConnectionProvider({ children }: ActiveConnectionProviderProps) {
  const [activeConnection, setActiveConnectionState] = useState<BrokerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshActiveConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connections = await getAllConnections();
      const active = connections.find(conn => conn.active) || null;
      
      console.log('🔄 Conexión activa actualizada:', active?.name || 'Ninguna');
      setActiveConnectionState(active);
      
    } catch (err) {
      console.error('❌ Error refreshing active connection:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setActiveConnectionState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveConnection = (connection: BrokerConnection | null) => {
    console.log('🔄 Cambiando conexión activa a:', connection?.name || 'Ninguna');
    setActiveConnectionState(connection);
  };

  // Cargar conexión activa al inicializar
  useEffect(() => {
    refreshActiveConnection();
  }, []);

  const isConnected = activeConnection !== null;

  return (
    <ActiveConnectionContext.Provider
      value={{
        activeConnection,
        isConnected,
        isLoading,
        error,
        setActiveConnection,
        refreshActiveConnection,
      }}
    >
      {children}
    </ActiveConnectionContext.Provider>
  );
}

export function useActiveConnection() {
  const context = useContext(ActiveConnectionContext);
  if (context === undefined) {
    throw new Error('useActiveConnection must be used within an ActiveConnectionProvider');
  }
  return context;
}
