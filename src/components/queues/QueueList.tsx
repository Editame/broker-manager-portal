import { useMemo, useState } from 'react';
import { QueueInfo, QueueFilters } from '@/types/queue';
import { QueueRow } from './QueueRow';
import { Search, Database, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type SortField = 'name' | 'messageCount' | 'consumerCount';
export type SortOrder = 'asc' | 'desc' | 'none';

interface QueueListProps {
  queues: QueueInfo[];
  filters: QueueFilters;
  selectedQueue: QueueInfo | null;
  onSelectQueue: (queue: QueueInfo) => void;
  onSendMessage?: (queue: QueueInfo) => void;
  onPurgeQueue?: (queue: QueueInfo) => void;
  onDeleteQueue?: (queue: QueueInfo) => void;
  onPauseQueue?: (queue: QueueInfo) => void;
  onPasteMessages?: (queue: QueueInfo) => void;
  clipboardHasMessages?: boolean;
  // Props para ordenamiento
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
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
  onPasteMessages,
  clipboardHasMessages,
  sortField: externalSortField,
  sortOrder: externalSortOrder,
  onSort,
}: QueueListProps) {
  // Usar estado externo si se proporciona, sino usar estado interno
  const [internalSortField, setInternalSortField] = useState<SortField>('name');
  const [internalSortOrder, setInternalSortOrder] = useState<SortOrder>('asc');
  
  const sortField = externalSortField ?? internalSortField;
  const sortOrder = externalSortOrder ?? internalSortOrder;

  const handleSort = (field: SortField) => {
    if (onSort) {
      // Usar función externa
      onSort(field);
    } else {
      // Usar estado interno
      if (internalSortField === field) {
        setInternalSortOrder(internalSortOrder === 'asc' ? 'desc' : internalSortOrder === 'desc' ? 'none' : 'asc');
      } else {
        setInternalSortField(field);
        setInternalSortOrder('asc');
      }
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    if (sortOrder === 'asc') return <ArrowUp className="h-3 w-3" />;
    if (sortOrder === 'desc') return <ArrowDown className="h-3 w-3" />;
    return <ArrowUpDown className="h-3 w-3" />;
  };

  /**
   * Convierte un patrón con wildcards (*) a expresión regular
   * Ejemplos:
   * - "purchase-orders*" → /^purchase-orders.*$/i
   * - "*error*" → /^.*error.*$/i  
   * - "purchase-orders*error*" → /^purchase-orders.*error.*$/i
   */
  const createPatternRegex = (pattern: string): RegExp | null => {
    try {
      // Si no contiene *, es búsqueda simple (mantener comportamiento actual)
      if (!pattern.includes('*')) {
        return null;
      }
      
      // Escapar caracteres especiales de regex excepto *
      const escapedPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escapar caracteres especiales
        .replace(/\*/g, '.*'); // Convertir * a .*
      
      // Crear regex con anchors para coincidencia completa
      return new RegExp(`^${escapedPattern}$`, 'i');
    } catch (error) {
      console.warn('Error creando patrón regex:', error);
      return null;
    }
  };

  const filteredAndSortedQueues = useMemo(() => {
    // Primero filtrar
    let filtered = queues.filter((queue) => {
      // Filtro general con soporte para patrones
      let matchesGeneral = true;
      if (filters.general) {
        const patternRegex = createPatternRegex(filters.general);
        if (patternRegex) {
          // Usar patrón con wildcards
          matchesGeneral = patternRegex.test(queue.name);
        } else {
          // Búsqueda simple (comportamiento original)
          matchesGeneral = queue.name.toLowerCase().includes(filters.general.toLowerCase());
        }
      }
      
      const matchesPrefix = !filters.prefix || 
        queue.name.toLowerCase().startsWith(filters.prefix.toLowerCase());
      
      const matchesSuffix = !filters.suffix || 
        queue.name.toLowerCase().endsWith(filters.suffix.toLowerCase());
      
      return matchesGeneral && matchesPrefix && matchesSuffix;
    });

    // Luego ordenar
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'messageCount':
            aValue = a.queueSize || 0;
            bValue = b.queueSize || 0;
            break;
          case 'consumerCount':
            aValue = a.consumerCount || 0;
            bValue = b.consumerCount || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [queues, filters, sortField, sortOrder]);

  const hasActiveFilters = filters.general || filters.prefix || filters.suffix;

  if (filteredAndSortedQueues.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header con controles de ordenamiento */}
        <div className="border-b border-slate-200 bg-white">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('name')}
                className="text-xs"
              >
                Nombre {getSortIcon('name')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('messageCount')}
                className="text-xs"
              >
                Mensajes {getSortIcon('messageCount')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('consumerCount')}
                className="text-xs"
              >
                Consumidores {getSortIcon('consumerCount')}
              </Button>
            </div>
          </div>
        </div>

        {/* Estado vacío */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              {hasActiveFilters ? (
                <Search className="h-8 w-8 text-slate-400" />
              ) : (
                <Database className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {hasActiveFilters ? 'No se encontraron colas' : 'No hay colas disponibles'}
            </h3>
            <p className="text-slate-500 max-w-sm">
              {hasActiveFilters 
                ? 'Intenta ajustar los filtros para encontrar las colas que buscas.'
                : 'Conecta con un broker ActiveMQ para ver las colas disponibles.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Lista de colas */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-slate-200">
          {filteredAndSortedQueues.map((queue, index) => (
            <QueueRow
              key={queue.name}
              queue={queue}
              index={index}
              isSelected={selectedQueue?.name === queue.name}
              onSelect={() => onSelectQueue(queue)}
              onSendMessage={onSendMessage ? () => onSendMessage(queue) : undefined}
              onPurgeQueue={onPurgeQueue ? () => onPurgeQueue(queue) : undefined}
              onDeleteQueue={onDeleteQueue ? () => onDeleteQueue(queue) : undefined}
              onPauseQueue={onPauseQueue ? () => onPauseQueue(queue) : undefined}
              onPasteMessages={onPasteMessages ? () => onPasteMessages(queue) : undefined}
              clipboardHasMessages={clipboardHasMessages}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
