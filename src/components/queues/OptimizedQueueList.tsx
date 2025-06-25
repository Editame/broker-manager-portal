import { useMemo, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { QueueInfo, QueueFilters } from '@/types/queue';
import { QueueRow } from './QueueRow';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Search, Database, Filter } from 'lucide-react';

interface OptimizedQueueListProps {
  queues: QueueInfo[];
  filters: QueueFilters;
  selectedQueue: QueueInfo | null;
  onSelectQueue: (queue: QueueInfo) => void;
  onSendMessage?: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
  onPauseQueue?: (queue: QueueInfo) => void;
}

// Componente de fila virtualizada que mantiene el diseño original
const VirtualizedQueueRow = memo(({ index, style, data }: any) => {
  const { 
    filteredQueues, 
    selectedQueue, 
    onSelectQueue, 
    onSendMessage, 
    onPurgeQueue, 
    onDeleteQueue, 
    onPauseQueue 
  } = data;
  
  const queue = filteredQueues[index];

  return (
    <div style={style}>
      <QueueRow
        queue={queue}
        index={index}
        isSelected={selectedQueue?.name === queue.name}
        onSelect={onSelectQueue}
        onSendMessage={onSendMessage}
        onPurgeQueue={onPurgeQueue}
        onDeleteQueue={onDeleteQueue}
        onPauseQueue={onPauseQueue}
      />
    </div>
  );
});

VirtualizedQueueRow.displayName = 'VirtualizedQueueRow';

export const OptimizedQueueList = memo<OptimizedQueueListProps>(({
  queues,
  filters,
  selectedQueue,
  onSelectQueue,
  onSendMessage,
  onPurgeQueue,
  onDeleteQueue,
  onPauseQueue,
}) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize();
  
  // Filtrado memoizado para mejor rendimiento
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

  // Estadísticas memoizadas
  const stats = useMemo(() => {
    const totalMessages = filteredQueues.reduce((sum, queue) => sum + queue.queueSize, 0);
    const totalConsumers = filteredQueues.reduce((sum, queue) => sum + queue.consumerCount, 0);
    const activeQueues = filteredQueues.filter(queue => queue.queueSize > 0).length;
    
    return { totalMessages, totalConsumers, activeQueues };
  }, [filteredQueues]);

  // Datos para el componente virtualizado
  const itemData = useMemo(() => ({
    filteredQueues,
    selectedQueue,
    onSelectQueue,
    onSendMessage,
    onPurgeQueue,
    onDeleteQueue,
    onPauseQueue,
  }), [filteredQueues, selectedQueue, onSelectQueue, onSendMessage, onPurgeQueue, onDeleteQueue, onPauseQueue]);

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

  // Decidir si usar virtualización o renderizado normal
  const shouldVirtualize = filteredQueues.length > 50; // Virtualizar solo si hay más de 50 colas

  return (
    <div className="flex flex-col h-full">
      {/* Header Compacto - Manteniendo el diseño original */}
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
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-medium border border-green-500/30">
                {shouldVirtualize ? 'virtualizado' : 'optimizado'}
              </span>
            </div>
          </div>

          {/* Métricas Compactas en una línea */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Mensajes:</span>
              <span className="text-white font-medium">{stats.totalMessages.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Consumidores:</span>
              <span className="text-white font-medium">{stats.totalConsumers}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Activas:</span>
              <span className="text-blue-400 font-medium">{stats.activeQueues}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista - Virtualizada o Normal según la cantidad */}
      <div className="flex-1 overflow-hidden">
        {shouldVirtualize ? (
          <List
            height={Math.max(400, windowHeight - 300)} // Altura dinámica con mínimo
            width={Math.max(300, windowWidth - 100)} // Ancho dinámico con mínimo
            itemCount={filteredQueues.length}
            itemSize={80} // Altura aproximada de cada QueueRow
            itemData={itemData}
            overscanCount={5} // Renderizar 5 elementos extra para scroll suave
            className="divide-y divide-slate-700/30"
          >
            {VirtualizedQueueRow}
          </List>
        ) : (
          <div className="h-full overflow-y-auto">
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
        )}
      </div>
    </div>
  );
});

OptimizedQueueList.displayName = 'OptimizedQueueList';
