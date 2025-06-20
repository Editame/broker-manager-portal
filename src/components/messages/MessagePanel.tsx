import { Message } from '@/types/message';
import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { Eye, Download, RefreshCcw, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

interface MessagePanelProps {
  queue: QueueInfo | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  onViewMessage: (message: Message) => void;
  onRefresh: () => void;
}

export function MessagePanel({
  queue,
  messages,
  loading,
  error,
  onViewMessage,
  onRefresh,
}: MessagePanelProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const truncateMessage = (body: string, maxLength: number = 80) => {
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
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-16 w-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Selecciona una cola
        </h3>
        <p className="text-slate-400">
          Elige una cola de la lista para ver sus mensajes
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Mensajes de: {queue.name}
            </h3>
            <p className="text-sm text-slate-400">
              {messages.length} mensaje{messages.length !== 1 ? 's' : ''} encontrado{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white transition-all duration-200"
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAllMessages}
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <LoadingSpinner count={5} />
          </div>
        ) : error ? (
          <div className="p-4">
            <ErrorMessage message={error} onRetry={onRefresh} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="h-12 w-12 text-slate-600 mb-4" />
            <div className="text-lg font-medium text-white mb-2">No hay mensajes</div>
            <p className="text-slate-400">Esta cola no contiene mensajes en este momento</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {messages.map((message) => (
              <div
                key={message.id}
                className="p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => onViewMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        {message.id.substring(0, 12)}...
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 font-mono leading-relaxed">
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
                    className="ml-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-200"
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
