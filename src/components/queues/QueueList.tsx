import { useMemo } from 'react';
import { QueueInfo, QueueFilters } from '@/types/queue';
import { QueueCard } from './QueueCard';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';

interface QueueListProps {
  queues: QueueInfo[];
  filters: QueueFilters;
  selectedQueue: QueueInfo | null;
  onSelectQueue: (queue: QueueInfo) => void;
  onViewMessages: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
}

export function QueueList({
  queues,
  filters,
  selectedQueue,
  onSelectQueue,
  onViewMessages,
  onPurgeQueue,
  onDeleteQueue,
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

  const {
    paginatedItems: paginatedQueues,
    paginationState,
    totalPages,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination(filteredQueues, 15);

  if (filteredQueues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          {queues.length === 0 ? 'No hay colas disponibles' : 'No se encontraron colas que coincidan con los filtros'}
        </div>
        {queues.length > 0 && (
          <div className="text-gray-400 text-sm">
            Intenta ajustar los filtros para ver más resultados
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Colas del Broker ({filteredQueues.length})
        </h2>
        <div className="text-sm text-gray-500">
          {filteredQueues.length !== queues.length && (
            <span>Mostrando {filteredQueues.length} de {queues.length} colas</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedQueues.map((queue) => (
          <QueueCard
            key={queue.name}
            queue={queue}
            isSelected={selectedQueue?.name === queue.name}
            onSelect={onSelectQueue}
            onViewMessages={onViewMessages}
            onPurgeQueue={onPurgeQueue}
            onDeleteQueue={onDeleteQueue}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          paginationState={paginationState}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      )}
    </div>
  );
}
