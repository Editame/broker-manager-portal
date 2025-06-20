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
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="general-filter" className="block text-sm font-medium text-slate-300 mb-2">
            Filtro General
          </label>
          <input
            id="general-filter"
            type="text"
            placeholder="Buscar en nombres de colas..."
            value={filters.general}
            onChange={(e) => handleFilterChange('general', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="prefix-filter" className="block text-sm font-medium text-slate-300 mb-2">
            Prefijo
          </label>
          <input
            id="prefix-filter"
            type="text"
            placeholder="Ej: order-, user-"
            value={filters.prefix}
            onChange={(e) => handleFilterChange('prefix', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="suffix-filter" className="block text-sm font-medium text-slate-300 mb-2">
            Sufijo
          </label>
          <input
            id="suffix-filter"
            type="text"
            placeholder="Ej: -queue, -dlq"
            value={filters.suffix}
            onChange={(e) => handleFilterChange('suffix', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
