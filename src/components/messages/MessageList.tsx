import { Message } from '@/types/message';
import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { Eye, Download, RefreshCcw } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

interface MessageListProps {
  queue: QueueInfo | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  onViewMessage: (message: Message) => void;
  onRefresh: () => void;
}

export function MessageList({
  queue,
  messages,
  loading,
  error,
  onViewMessage,
  onRefresh,
}: MessageListProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const truncateMessage = (body: string, maxLength: number = 100) => {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '...';
  };

  const downloadAllMessages = () => {
    if (messages.length === 0) return;
    
    const content = messages.map(msg => 
      `ID: ${msg.id}\nTimestamp: ${msg.timestamp}\nBody:\n${msg.body}\n${'='.repeat(50)}\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${queue?.name || 'unknown'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!queue) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Selecciona una cola</h3>
          <p>Elige una cola de la lista para ver sus mensajes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mensajes de: {queue.name}
            </h3>
            <p className="text-sm text-gray-600">
              {messages.length} mensaje{messages.length !== 1 ? 's' : ''} encontrado{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAllMessages}
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar Todo
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <LoadingSpinner count={3} />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} onRetry={onRefresh} />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No hay mensajes</div>
            <p>Esta cola no contiene mensajes en este momento</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {message.id.substring(0, 8)}...
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-mono">
                      {truncateMessage(message.body)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMessage(message);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
