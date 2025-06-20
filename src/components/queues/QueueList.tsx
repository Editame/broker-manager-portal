import { useMemo } from 'react';
import { QueueInfo, QueueFilters } from '@/types/queue';
import { QueueRow } from './QueueRow';
import { Search, Database, Filter } from 'lucide-react';

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

  const hasActiveFilters = filters.general || filters.prefix || filters.suffix;

  // Calcular estadísticas
  const totalMessages = filteredQueues.reduce((sum, queue) => sum + queue.queueSize, 0);
  const totalConsumers = filteredQueues.reduce((sum, queue) => sum + queue.consumerCount, 0);
  const activeQueues = filteredQueues.filter(queue => queue.queueSize > 0).length;

  if (filteredQueues.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header Compacto */}
        <div className="border-b border-slate-200 bg-white">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-1.5 rounded border border-blue-500/20">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">
                  Colas del Broker
                </h2>
                <p className="text-xs text-slate-600">
                  {queues.length} colas disponibles
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado Vacío Compacto */}
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="bg-slate-700/30 rounded-full p-4 mb-3">
            <Search className="h-8 w-8 text-slate-500" />
          </div>
          <div className="text-base font-medium text-white mb-2">
            {queues.length === 0 ? 'Sin colas' : 'Sin resultados'}
          </div>
          <p className="text-slate-400 text-sm mb-3 max-w-xs">
            {queues.length === 0 
              ? 'No hay colas en el broker' 
              : 'Ajusta los filtros para ver más colas'
            }
          </p>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="h-3 w-3" />
              <span>Filtros activos</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Compacto */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-750">
        <div className="p-3">
          {/* Título y Contador */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 p-1.5 rounded border border-blue-500/30">
                <Database className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  Colas del Broker
                </h2>
                <p className="text-xs text-slate-400">
                  {filteredQueues.length} de {queues.length} colas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full font-medium border border-amber-500/30">
                  filtrado
                </span>
              )}
            </div>
          </div>

          {/* Métricas Compactas en una línea */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-600">Mensajes:</span>
              <span className="text-slate-800 font-medium">{totalMessages.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-600">Consumidores:</span>
              <span className="text-slate-800 font-medium">{totalConsumers}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-600">Activas:</span>
              <span className="text-blue-600 font-medium">{activeQueues}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Colas Compacta */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-slate-700/30">
          {filteredQueues.map((queue, index) => (
            <QueueRow
              key={queue.name}
              queue={queue}
              index={index}
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
    </div>
  );
}
