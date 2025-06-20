import { useState, useMemo } from 'react';
import { Message } from '@/types/message';
import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { Eye, Download, RefreshCcw, MessageSquare, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

type SortOrder = 'asc' | 'desc' | 'none';

interface MessagePanelProps {
  queue: QueueInfo | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  onViewMessage: (message: Message) => void;
  onRefresh: () => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessagePanel({
  queue,
  messages,
  loading,
  error,
  onViewMessage,
  onRefresh,
  onDeleteMessage,
}: MessagePanelProps) {
  const [bodyFilter, setBodyFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // Filtrar y ordenar mensajes
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages;

    // Filtrar por contenido del body
    if (bodyFilter.trim()) {
      const filterLower = bodyFilter.toLowerCase();
      filtered = messages.filter(message => 
        message.body.toLowerCase().includes(filterLower)
      );
    }

    // Ordenar por fecha
    if (sortOrder !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }

    return filtered;
  }, [messages, bodyFilter, sortOrder]);

  const handleSortToggle = () => {
    if (sortOrder === 'none') {
      setSortOrder('desc'); // Más recientes primero
    } else if (sortOrder === 'desc') {
      setSortOrder('asc'); // Más antiguos primero
    } else {
      setSortOrder('none'); // Sin ordenar
    }
  };

  const clearBodyFilter = () => {
    setBodyFilter('');
  };

  const handleDeleteMessage = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteMessage && confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      onDeleteMessage(messageId);
    }
  };
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
    const messagesToDownload = filteredAndSortedMessages.length > 0 ? filteredAndSortedMessages : messages;
    if (messagesToDownload.length === 0) return;
    
    const content = messagesToDownload.map(msg => 
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

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'asc':
        return <ArrowUp className="h-4 w-4" />;
      case 'desc':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'asc':
        return 'Más antiguos primero';
      case 'desc':
        return 'Más recientes primero';
      default:
        return 'Ordenar por fecha';
    }
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
      {/* Header Compacto y Mejorado */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-750">
        <div className="flex items-center justify-between p-3">
          {/* Título y Contador */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-400" />
              <h3 className="font-semibold text-white text-lg">
                {queue.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full font-medium border border-teal-500/30">
                {filteredAndSortedMessages.length}/{messages.length}
              </span>
              {bodyFilter && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full font-medium border border-amber-500/30">
                  filtrado: "{bodyFilter}"
                </span>
              )}
            </div>
          </div>

          {/* Controles de Acción */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
              title="Actualizar mensajes"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadAllMessages}
                className="text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all duration-200"
                title="Descargar mensajes"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Barra de Herramientas Integrada */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2">
            {/* Filtro por contenido del body */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en contenido de mensajes..."
                value={bodyFilter}
                onChange={(e) => setBodyFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-slate-700 transition-all duration-200 text-sm"
              />
              {bodyFilter && (
                <button
                  onClick={clearBodyFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Botón de ordenamiento mejorado */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSortToggle}
              className="text-slate-300 hover:text-white hover:bg-slate-600/50 transition-all duration-200 px-3 border border-slate-600/50 rounded-lg"
              title={getSortLabel()}
            >
              {getSortIcon()}
              <span className="ml-1 text-xs font-medium hidden sm:inline">
                {sortOrder === 'none' ? 'Fecha' : sortOrder === 'desc' ? 'Recientes' : 'Antiguos'}
              </span>
            </Button>
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
        ) : filteredAndSortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-slate-700/30 rounded-full p-6 mb-4">
              <MessageSquare className="h-12 w-12 text-slate-500" />
            </div>
            <div className="text-lg font-medium text-white mb-2">
              {bodyFilter ? 'Sin resultados' : 'Cola vacía'}
            </div>
            <p className="text-slate-400 mb-4 max-w-sm">
              {bodyFilter 
                ? `No encontramos mensajes con "${bodyFilter}"` 
                : 'Esta cola no tiene mensajes en este momento'
              }
            </p>
            {bodyFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearBodyFilter}
                className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtro
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredAndSortedMessages.map((message, index) => {
              const isRecent = new Date(message.timestamp).getTime() > Date.now() - 5 * 60 * 1000; // Últimos 5 minutos
              const messageAge = Date.now() - new Date(message.timestamp).getTime();
              const isVeryRecent = messageAge < 60 * 1000; // Último minuto
              
              return (
                <div
                  key={message.id}
                  className="group hover:bg-gradient-to-r hover:from-slate-700/30 hover:to-slate-600/20 transition-all duration-200 cursor-pointer border-l-2 border-transparent hover:border-l-teal-500/50"
                  onClick={() => onViewMessage(message)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      {/* Contenido Principal */}
                      <div className="flex-1 min-w-0">
                        {/* Header del Mensaje */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Indicador de Estado */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isVeryRecent ? 'bg-emerald-400 animate-pulse' : 
                              isRecent ? 'bg-teal-400' : 'bg-slate-500'
                            }`} />
                            <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                              #{index + 1} • {message.id.substring(0, 8)}...
                            </span>
                          </div>
                          
                          {/* Timestamp */}
                          <span className="text-xs text-slate-500 font-medium">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          
                          {/* Badge de Reciente */}
                          {isVeryRecent && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full font-medium border border-emerald-500/30">
                              Nuevo
                            </span>
                          )}
                        </div>

                        {/* Contenido del Mensaje */}
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                          <p className="text-sm text-slate-300 font-mono leading-relaxed break-all">
                            {truncateMessage(message.body, 120)}
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 ml-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMessage(message);
                          }}
                          className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 transition-all duration-200 h-8 w-8 p-0"
                          title="Ver mensaje completo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onDeleteMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteMessage(message.id, e)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200 h-8 w-8 p-0"
                            title="Eliminar mensaje"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
