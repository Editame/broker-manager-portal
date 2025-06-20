import { QueueInfo } from '@/types/queue';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipRoot } from '@/components/ui/Tooltip';
import {
  Send,
  Trash2,
  XCircle,
  LogOut,
  Users,
  Eye,
} from 'lucide-react';

interface QueueCardProps {
  queue: QueueInfo;
  isSelected: boolean;
  onSelect: (queue: QueueInfo) => void;
  onViewMessages: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
}

export function QueueCard({
  queue,
  isSelected,
  onSelect,
  onViewMessages,
  onPurgeQueue,
  onDeleteQueue,
}: QueueCardProps) {
  const getQueueStatusColor = (queueSize: number, consumerCount: number) => {
    if (queueSize > 100) return 'text-red-600 bg-red-50';
    if (queueSize > 10) return 'text-yellow-600 bg-yellow-50';
    if (consumerCount === 0) return 'text-gray-600 bg-gray-50';
    return 'text-green-600 bg-green-50';
  };

  const statusColor = getQueueStatusColor(queue.queueSize, queue.consumerCount);

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onSelect(queue)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {queue.name}
          </h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusColor}`}>
            {queue.queueSize > 100 ? 'Alta carga' :
             queue.queueSize > 10 ? 'Carga media' :
             queue.consumerCount === 0 ? 'Sin consumidores' : 'Normal'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Send className="h-3 w-3" />
          <span>Mensajes: {queue.queueSize}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Consumidores: {queue.consumerCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <LogOut className="h-3 w-3" />
          <span>Enviados: {queue.enqueueCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          <span>Procesados: {queue.dequeueCount}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <TooltipRoot>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewMessages(queue);
              }}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver mensajes de la cola</TooltipContent>
        </TooltipRoot>

        {onPurgeQueue && (
          <TooltipRoot>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPurgeQueue(queue);
                }}
                disabled={queue.queueSize === 0}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Purgar mensajes de la cola</TooltipContent>
          </TooltipRoot>
        )}

        {onDeleteQueue && (
          <TooltipRoot>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQueue(queue);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar cola</TooltipContent>
          </TooltipRoot>
        )}
      </div>
    </div>
  );
}
