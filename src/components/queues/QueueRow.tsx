import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { TooltipRoot, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  Send,
  Trash2,
  XCircle,
  Pause,
  Play,
  MessageCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Clipboard,
} from 'lucide-react';

interface QueueRowProps {
  queue: QueueInfo;
  index: number;
  isSelected: boolean;
  onSelect: (queue: QueueInfo) => void;
  onSendMessage?: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
  onPauseQueue?: (queue: QueueInfo) => void;
  onPasteMessages?: (queue: QueueInfo) => void;
  clipboardHasMessages?: boolean;
}

export function QueueRow({
  queue,
  index,
  isSelected,
  onSelect,
  onSendMessage,
  onPurgeQueue,
  onDeleteQueue,
  onPauseQueue,
  onPasteMessages,
  clipboardHasMessages,
}: QueueRowProps) {
  // Simulamos el estado de pausa (en el futuro vendrá del backend)
  const isPaused = false; // TODO: obtener del backend
  
  // Determinar el estado de la cola de forma más simple
  const getQueueStatus = () => {
    if (queue.queueSize === 0) return { color: 'bg-slate-500', label: 'Vacía' };
    if (queue.queueSize > 100) return { color: 'bg-red-400', label: 'Alta' };
    if (queue.queueSize > 10) return { color: 'bg-amber-400', label: 'Media' };
    return { color: 'bg-emerald-400', label: 'Normal' };
  };

  const status = getQueueStatus();
  const hasConsumers = queue.consumerCount > 0;

  return (
    <div
      className={`group cursor-pointer transition-all duration-150 hover:bg-slate-100/80 ${
        isSelected
          ? 'bg-blue-50/80 border-l-2 border-l-blue-500'
          : 'border-l-2 border-l-transparent hover:border-l-blue-500/50'
      }`}
      onClick={() => onSelect(queue)}
    >
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Contenido Principal - Compacto con Iconos */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            {/* Indicador y Número */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-xs font-mono text-slate-500 w-6">
                #{index + 1}
              </span>
            </div>
            
            {/* Nombre de la Cola */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-slate-800 truncate text-sm">
                  {queue.name}
                </h3>
                {hasConsumers && (
                  <span className="text-xs bg-blue-500/20 text-blue-700 px-1.5 py-0.5 rounded border border-blue-500/30">
                    Activa
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 flex-shrink-0">
              {/* Mensajes */}
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-cyan-500" />
                <span className="text-slate-800 font-medium">{queue.queueSize}</span>
              </div>
              
              {/* Consumidores */}
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-slate-800 font-medium">{queue.consumerCount}</span>
              </div>
              
              {/* Enqueue/Dequeue con iconos de flechas */}
              <div className="flex items-center gap-1 font-mono">
                <div className="flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">{queue.enqueueCount}</span>
                </div>
                <span className="text-slate-400">/</span>
                <div className="flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 font-medium">{queue.dequeueCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Compactas */}
          <div className="flex items-center gap-0.5 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            {/* Pegar Mensajes */}
            {onPasteMessages && clipboardHasMessages && (
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPasteMessages(queue);
                    }}
                    className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-150"
                  >
                    <Clipboard className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pegar mensajes</TooltipContent>
              </TooltipRoot>
            )}
            
            {/* Enviar Mensaje */}
            {onSendMessage && (
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendMessage(queue);
                    }}
                    className="h-6 w-6 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all duration-150"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enviar</TooltipContent>
              </TooltipRoot>
            )}

            {/* Pausar/Reanudar */}
            {onPauseQueue && (
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPauseQueue(queue);
                    }}
                    className="h-6 w-6 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all duration-150"
                  >
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isPaused ? 'Reanudar' : 'Pausar'}</TooltipContent>
              </TooltipRoot>
            )}

            {/* Purgar */}
            {onPurgeQueue && (
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPurgeQueue(queue);
                    }}
                    disabled={queue.queueSize === 0}
                    className="h-6 w-6 p-0 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 disabled:opacity-30 transition-all duration-150"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Purgar</TooltipContent>
              </TooltipRoot>
            )}

            {/* Eliminar */}
            {onDeleteQueue && (
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQueue(queue);
                    }}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-150"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </TooltipRoot>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
