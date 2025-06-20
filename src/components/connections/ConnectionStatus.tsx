import { useConnections } from '@/hooks/useConnections';
import { Button } from '@/components/ui/Button';
import { Database, Settings } from 'lucide-react';

interface ConnectionStatusProps {
  onOpenSettings?: () => void;
}

export function ConnectionStatus({ onOpenSettings }: ConnectionStatusProps) {
  const { activeConnection, loading } = useConnections();

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

  if (!activeConnection) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Sin conexión</span>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-green-500';
      case 'ERROR':
        return 'bg-red-500';
      case 'TESTING':
        return 'bg-yellow-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'Conectado';
      case 'ERROR':
        return 'Error';
      case 'TESTING':
        return 'Probando...';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(activeConnection.lastTestStatus)}`}></div>
        <div className="flex flex-col">
          <span className="text-slate-700 font-medium">{activeConnection.name}</span>
          <span className="text-xs text-slate-500">
            {activeConnection.host}:{activeConnection.port} • {getStatusText(activeConnection.lastTestStatus)}
          </span>
        </div>
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
