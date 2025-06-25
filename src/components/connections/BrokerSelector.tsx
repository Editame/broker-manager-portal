import { useState } from 'react';
import { useConnections } from '@/hooks/useConnections';
import { Button } from '@/components/ui/Button';
import { Database, ChevronDown, Settings } from 'lucide-react';

interface BrokerSelectorProps {
  onOpenSettings?: () => void;
  onBrokerChange?: () => void;
}

export function BrokerSelector({ onOpenSettings, onBrokerChange }: BrokerSelectorProps) {
  const { connections, activeConnection, isUserConnected, loading, connectToConnection } = useConnections();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSwitchBroker = async (connectionId: string) => {
    if (connectionId === activeConnection?.id) return;
    
    try {
      setIsConnecting(true);
      setShowDropdown(false);
      
      await connectToConnection(connectionId);
      
      // Disparar callback para actualizar datos - SIN RECARGA
      setTimeout(() => {
        onBrokerChange?.();
      }, 500);
      
    } catch (error) {
      console.error('Error switching broker:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Database className="h-4 w-4 animate-pulse" />
        <span>Cargando...</span>
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="text-slate-500 hover:text-slate-700"
            title="Configurar conexiones"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (!activeConnection || !isUserConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>No conectado</span>
        </div>
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="text-slate-500 hover:text-slate-700"
            title="Configurar conexiones"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  const availableConnections = connections.filter(conn => conn.id !== activeConnection.id);

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          disabled={isConnecting}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Database className="h-4 w-4" />
          <span className="font-medium">{activeConnection.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-50">
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Broker Actual
              </div>
              <div className="flex items-center gap-2 px-2 py-2 bg-green-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">{activeConnection.name}</div>
                  <div className="text-xs text-slate-500">
                    {activeConnection.host}:{activeConnection.port}
                  </div>
                </div>
              </div>
              
              {availableConnections.length > 0 && (
                <>
                  <div className="border-t border-slate-200 my-2"></div>
                  <div className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Cambiar a
                  </div>
                  {availableConnections.map((connection) => (
                    <button
                      key={connection.id}
                      onClick={() => handleSwitchBroker(connection.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-50 rounded disabled:opacity-50"
                      disabled={isConnecting}
                    >
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{connection.name}</div>
                        <div className="text-xs text-slate-500">
                          {connection.host}:{connection.port}
                        </div>
                      </div>
                      {isConnecting && (
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                      )}
                    </button>
                  ))}
                </>
              )}
              
              <div className="border-t border-slate-200 my-2"></div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenSettings?.();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-50 rounded text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Gestionar conexiones</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
