import { Filter } from 'lucide-react';
import { QueueFilters as QueueFiltersType } from '@/types/queue';

interface QueueFiltersProps {
  filters: QueueFiltersType;
  onFiltersChange: (filters: QueueFiltersType) => void;
}

export function QueueFilters({ filters, onFiltersChange }: QueueFiltersProps) {
  const handleFilterChange = (key: keyof QueueFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="general-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filtro General
          </label>
          <input
            id="general-filter"
            type="text"
            placeholder="Buscar en nombres de colas..."
            value={filters.general}
            onChange={(e) => handleFilterChange('general', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="prefix-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Prefijo
          </label>
          <input
            id="prefix-filter"
            type="text"
            placeholder="Ej: order-, user-"
            value={filters.prefix}
            onChange={(e) => handleFilterChange('prefix', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="suffix-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Sufijo
          </label>
          <input
            id="suffix-filter"
            type="text"
            placeholder="Ej: -queue, -dlq"
            value={filters.suffix}
            onChange={(e) => handleFilterChange('suffix', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
