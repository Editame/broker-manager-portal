import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { TooltipRoot, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import {
  Send,
  Trash2,
  XCircle,
  Pause,
  Play,
} from 'lucide-react';

interface QueueRowProps {
  queue: QueueInfo;
  isSelected: boolean;
  onSelect: (queue: QueueInfo) => void;
  onSendMessage?: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
  onPauseQueue?: (queue: QueueInfo) => void;
}

export function QueueRow({
  queue,
  isSelected,
  onSelect,
  onSendMessage,
  onPurgeQueue,
  onDeleteQueue,
  onPauseQueue,
}: QueueRowProps) {
  // Simulamos el estado de pausa (en el futuro vendrá del backend)
  const isPaused = false; // TODO: obtener del backend

  return (
    <div
      className={`grid grid-cols-12 gap-2 px-3 py-2 cursor-pointer transition-all duration-200 border-b border-slate-700/50 hover:bg-slate-700/50 text-sm ${
        isSelected
          ? 'bg-blue-900/30 border-l-4 border-l-blue-500'
          : ''
      }`}
      onClick={() => onSelect(queue)}
    >
      {/* Nombre de la cola */}
      <div className="col-span-4 flex items-center min-w-0">
        <div className="truncate">
          <div className="text-sm font-medium text-white truncate">
            {queue.name}
          </div>
          <div className="text-xs text-slate-500">
            E: {queue.enqueueCount} | D: {queue.dequeueCount}
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="text-sm font-semibold text-white">
          {queue.queueSize}
        </span>
      </div>

      {/* Consumidores */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="text-sm font-semibold text-white">
          {queue.consumerCount}
        </span>
      </div>

      {/* Acciones - Más espacio */}
      <div className="col-span-4 flex items-center justify-end gap-1.5 pr-2">
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
                className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-200"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enviar mensaje</TooltipContent>
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
                className="h-7 w-7 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all duration-200"
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPaused ? 'Reanudar cola' : 'Pausar cola'}</TooltipContent>
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
                className="h-7 w-7 p-0 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 disabled:opacity-30 transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Purgar mensajes</TooltipContent>
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
                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar cola</TooltipContent>
          </TooltipRoot>
        )}
      </div>
    </div>
  );
}
