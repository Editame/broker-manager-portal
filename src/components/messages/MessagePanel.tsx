import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types/message';
import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { 
  Eye, Download, RefreshCcw, MessageSquare, Search, ArrowUpDown, 
  ArrowUp, ArrowDown, Trash2, X, Clock, ChevronDown, 
  Copy, Scissors, CheckSquare, Square, CopyCheck
} from 'lucide-react';
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
  onCopyMessages?: (messages: Message[]) => void;
  onCutMessages?: (messages: Message[]) => void;
}

export function MessagePanel({
  queue,
  messages,
  loading,
  error,
  onViewMessage,
  onRefresh,
  onDeleteMessage,
  onCopyMessages,
  onCutMessages,
}: MessagePanelProps) {
  const [bodyFilter, setBodyFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  
  // Selección múltiple
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Auto-refresh state
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(45); // Default 45s
  const [showRefreshDropdown, setShowRefreshDropdown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  // Auto-refresh logic
  useEffect(() => {
    const startAutoRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (queue && autoRefreshInterval > 0) {
        intervalRef.current = setInterval(() => {
          onRefresh();
          lastRefreshRef.current = Date.now();
        }, autoRefreshInterval * 1000);
      }
    };

    startAutoRefresh();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queue, autoRefreshInterval, onRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Limpiar selección cuando cambia la cola o los mensajes
  useEffect(() => {
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
  }, [queue, messages.length]);

  // Filtrado y ordenación (debe estar antes de los callbacks que lo usan)
  const filteredAndSortedMessages = useMemo(() => {
    // Primero filtrar
    let result = messages;
    if (bodyFilter) {
      result = messages.filter(msg => 
        msg.body.toLowerCase().includes(bodyFilter.toLowerCase())
      );
    }
    
    // Luego ordenar
    if (sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    return result;
  }, [messages, bodyFilter, sortOrder]);

  // Métodos para selección múltiple
  const toggleMessageSelection = useCallback((messageId: string, event?: React.MouseEvent) => {
    // Si se presiona Shift, seleccionar/deseleccionar sin cambiar el modo
    const isShiftKey = event?.shiftKey;
    
    setSelectedMessageIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(messageId)) {
        newSelection.delete(messageId);
        // Si no quedan mensajes seleccionados y no es shift, salir del modo selección
        if (newSelection.size === 0 && !isShiftKey) {
          setSelectionMode(false);
        }
      } else {
        newSelection.add(messageId);
        // Si es el primer mensaje seleccionado y no es shift, entrar en modo selección
        if (newSelection.size === 1 && !isShiftKey) {
          setSelectionMode(true);
        }
      }
      return newSelection;
    });
  }, []);

  const selectAllMessages = useCallback(() => {
    // Seleccionar solo los mensajes visibles (filtrados)
    const visibleIds = filteredAndSortedMessages.map(msg => msg.id);
    setSelectedMessageIds(new Set(visibleIds));
    setSelectionMode(true);
  }, [filteredAndSortedMessages]);

  const selectAllVisibleMessages = useCallback(() => {
    // Alias para mayor claridad
    selectAllMessages();
  }, [selectAllMessages]);

  const clearSelection = useCallback(() => {
    setSelectedMessageIds(new Set());
    setSelectionMode(false);
  }, []);

  const handleCopySelectedMessages = useCallback(() => {
    if (selectedMessageIds.size === 0 || !onCopyMessages) return;
    
    const selectedMessages = messages.filter(
      msg => selectedMessageIds.has(msg.id)
    );
    
    onCopyMessages(selectedMessages);
    // No limpiar la selección después de copiar
  }, [selectedMessageIds, messages, onCopyMessages]);

  const handleCutSelectedMessages = useCallback(() => {
    if (selectedMessageIds.size === 0 || !onCutMessages) return;
    
    const selectedMessages = messages.filter(
      msg => selectedMessageIds.has(msg.id)
    );
    
    onCutMessages(selectedMessages);
    clearSelection(); // Limpiar selección después de cortar
  }, [selectedMessageIds, messages, onCutMessages, clearSelection]);

  // Opciones de auto-refresh
  const refreshOptions = [
    { label: '3s', value: 3 },
    { label: '5s', value: 5 },
    { label: '10s', value: 10 },
    { label: 'None', value: 45 }
  ];

  // Handlers
  const handleBodyFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyFilter(e.target.value);
  };

  const clearBodyFilter = () => {
    setBodyFilter('');
  };

  const handleSortOrderChange = () => {
    setSortOrder(current => {
      if (current === 'none') return 'desc';
      if (current === 'desc') return 'asc';
      return 'none';
    });
  };

  const handleRefreshIntervalChange = (value: number) => {
    setAutoRefreshInterval(value);
    setShowRefreshDropdown(false);
  };

  const handleManualRefresh = () => {
    onRefresh();
    lastRefreshRef.current = Date.now();
  };

  const handleDeleteMessage = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteMessage) {
      if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
        onDeleteMessage(messageId);
      }
    }
  };

  const getCurrentRefreshLabel = () => {
    const option = refreshOptions.find(opt => opt.value === autoRefreshInterval);
    return option ? option.label : '45s';
  };

  const downloadAllMessages = () => {
    const data = JSON.stringify(filteredAndSortedMessages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${queue?.name || 'queue'}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const truncateMessage = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!queue) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-slate-200/50 rounded-full p-6 mb-4">
          <MessageSquare className="h-12 w-12 text-slate-500" />
        </div>
        <div className="text-lg font-medium text-slate-800 mb-2">
          Selecciona una cola
        </div>
        <p className="text-slate-600 max-w-sm">
          Selecciona una cola de la lista para ver sus mensajes
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Compacto y Mejorado */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between p-3">
          {/* Título y Contador */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-500" />
              <h3 className="font-semibold text-slate-800 text-lg">
                {queue.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-cyan-500/10 text-cyan-700 px-2 py-1 rounded-full font-medium border border-cyan-500/20">
                {filteredAndSortedMessages.length}/{messages.length}
              </span>
              {bodyFilter && (
                <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-1 rounded-full font-medium border border-amber-500/20">
                  filtrado: "{bodyFilter}"
                </span>
              )}
              {selectedMessageIds.size > 0 && (
                <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-500/20">
                  {selectedMessageIds.size} seleccionados
                </span>
              )}
            </div>
          </div>

          {/* Controles de Acción */}
          <div className="flex items-center gap-2">
            {/* Controles de selección múltiple */}
            {selectionMode ? (
              <>
                {onCopyMessages && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySelectedMessages}
                    disabled={selectedMessageIds.size === 0}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    title="Copiar mensajes seleccionados"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                
                {onCutMessages && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCutSelectedMessages}
                    disabled={selectedMessageIds.size === 0}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    title="Cortar mensajes seleccionados"
                  >
                    <Scissors className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllMessages}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  title={`Seleccionar todos los visibles (${filteredAndSortedMessages.length})`}
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  title="Cancelar selección"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {/* Botón de refresh manual */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  title="Actualizar mensajes"
                >
                  <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                
                {/* Selector de auto-refresh */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRefreshDropdown(!showRefreshDropdown)}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 flex items-center gap-1"
                    title={`Auto-refresh: ${getCurrentRefreshLabel()}`}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">{getCurrentRefreshLabel()}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showRefreshDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-20 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {refreshOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleRefreshIntervalChange(option.value)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                              autoRefreshInterval === option.value 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'text-slate-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Botón para iniciar modo selección */}
                {messages.length > 0 && (onCopyMessages || onCutMessages) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectionMode(true)}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    title="Activar modo selección"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                )}
                
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadAllMessages}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    title="Descargar mensajes"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filtros y Ordenación */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={bodyFilter}
                onChange={handleBodyFilterChange}
                placeholder="Filtrar por contenido..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {bodyFilter && (
                <button
                  onClick={clearBodyFilter}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSortOrderChange}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 h-10 px-3"
              title="Cambiar orden"
            >
              {sortOrder === 'none' && <ArrowUpDown className="h-4 w-4" />}
              {sortOrder === 'desc' && <ArrowDown className="h-4 w-4" />}
              {sortOrder === 'asc' && <ArrowUp className="h-4 w-4" />}
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
            <ErrorMessage message={error} onRetry={handleManualRefresh} />
          </div>
        ) : filteredAndSortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-slate-200/50 rounded-full p-6 mb-4">
              <MessageSquare className="h-12 w-12 text-slate-500" />
            </div>
            <div className="text-lg font-medium text-slate-800 mb-2">
              {bodyFilter ? 'Sin resultados' : 'Cola vacía'}
            </div>
            <p className="text-slate-600 mb-4 max-w-sm">
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
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtro
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredAndSortedMessages.map((message, index) => {
              const isRecent = new Date(message.timestamp).getTime() > Date.now() - 5 * 60 * 1000; // Últimos 5 minutos
              const messageAge = Date.now() - new Date(message.timestamp).getTime();
              const isVeryRecent = messageAge < 60 * 1000; // Último minuto
              
              return (
                <div
                  key={message.id}
                  className={`group hover:bg-slate-50 transition-all duration-200 cursor-pointer border-l-2 ${
                    selectedMessageIds.has(message.id) 
                      ? 'border-l-blue-500 bg-blue-50/50' 
                      : 'border-transparent hover:border-l-cyan-500/50'
                  }`}
                  onClick={(e) => {
                    if (selectionMode) {
                      toggleMessageSelection(message.id, e);
                    } else {
                      onViewMessage(message);
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      {/* Contenido Principal */}
                      <div className="flex-1 min-w-0">
                        {/* Header del Mensaje */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Checkbox de selección */}
                          <div 
                            className="flex items-center justify-center w-5 h-5 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessageSelection(message.id, e);
                            }}
                          >
                            {selectedMessageIds.has(message.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className={`h-4 w-4 ${selectionMode ? 'text-slate-400' : 'text-transparent group-hover:text-slate-300'}`} />
                            )}
                          </div>
                          
                          {/* Indicador de Estado */}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isVeryRecent ? 'bg-emerald-500 animate-pulse' : 
                              isRecent ? 'bg-cyan-500' : 'bg-slate-400'
                            }`} />
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              #{index + 1} • {message.id.substring(0, 8)}...
                            </span>
                          </div>
                          
                          {/* Timestamp */}
                          <span className="text-xs text-slate-500 font-medium">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          
                          {/* Badge de Reciente */}
                          {isVeryRecent && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-700 px-2 py-1 rounded-full font-medium border border-emerald-500/30">
                              Nuevo
                            </span>
                          )}
                        </div>

                        {/* Contenido del Mensaje */}
                        <div className="bg-slate-100/50 rounded-lg p-3 border border-slate-200">
                          <p className="text-sm text-slate-700 font-mono leading-relaxed break-all">
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
                          className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/20 transition-all duration-200 h-8 w-8 p-0"
                          title="Ver mensaje completo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onDeleteMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteMessage(message.id, e)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/20 transition-all duration-200 h-8 w-8 p-0"
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
