import { useMemo } from 'react';
import { QueueInfo, QueueFilters } from '@/types/queue';
import { QueueRow } from './QueueRow';
import { Search } from 'lucide-react';

interface QueueListProps {
  queues: QueueInfo[];
  filters: QueueFilters;
  selectedQueue: QueueInfo | null;
  onSelectQueue: (queue: QueueInfo) => void;
  onSendMessage?: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
  onPauseQueue?: (queue: QueueInfo) => void;
}

export function QueueList({
  queues,
  filters,
  selectedQueue,
  onSelectQueue,
  onSendMessage,
  onPurgeQueue,
  onDeleteQueue,
  onPauseQueue,
}: QueueListProps) {
  const filteredQueues = useMemo(() => {
    return queues.filter((queue) => {
      const matchesGeneral = !filters.general || 
        queue.name.toLowerCase().includes(filters.general.toLowerCase());
      
      const matchesPrefix = !filters.prefix || 
        queue.name.toLowerCase().startsWith(filters.prefix.toLowerCase());
      
      const matchesSuffix = !filters.suffix || 
        queue.name.toLowerCase().endsWith(filters.suffix.toLowerCase());

      return matchesGeneral && matchesPrefix && matchesSuffix;
    });
  }, [queues, filters]);

  if (filteredQueues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Search className="h-12 w-12 text-slate-500 mb-4" />
        <div className="text-slate-400 text-lg mb-2">
          {queues.length === 0 ? 'No hay colas disponibles' : 'No se encontraron colas'}
        </div>
        {queues.length > 0 && (
          <div className="text-slate-500 text-sm">
            Intenta ajustar los filtros para ver más resultados
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Colas del Broker
          </h2>
          <div className="text-sm text-slate-400">
            {filteredQueues.length} de {queues.length} colas
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-700 text-xs font-medium text-slate-300 uppercase tracking-wider border-b border-slate-600">
        <div className="col-span-4">Nombre</div>
        <div className="col-span-2 text-center">Mensajes</div>
        <div className="col-span-2 text-center">Consumidores</div>
        <div className="col-span-4 text-right pr-2">Acciones</div>
      </div>

      {/* Queue List - Con scroll */}
      <div className="flex-1 overflow-y-auto">
        {filteredQueues.map((queue) => (
          <QueueRow
            key={queue.name}
            queue={queue}
            isSelected={selectedQueue?.name === queue.name}
            onSelect={onSelectQueue}
            onSendMessage={onSendMessage}
            onPurgeQueue={onPurgeQueue}
            onDeleteQueue={onDeleteQueue}
            onPauseQueue={onPauseQueue}
          />
        ))}
      </div>
    </div>
  );
}
