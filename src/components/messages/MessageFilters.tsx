import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Filter, Search, SortAsc, SortDesc, X } from 'lucide-react';

export interface MessageFilters {
  bodyFilter: string;
  headerKey: string;
  headerValue: string;
  sortBy: 'timestamp' | 'id';
  sortOrder: 'asc' | 'desc';
}

interface MessageFiltersProps {
  filters: MessageFilters;
  onFiltersChange: (filters: MessageFilters) => void;
  onClearFilters: () => void;
}

export function MessageFilters({ filters, onFiltersChange, onClearFilters }: MessageFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof MessageFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleSort = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const hasActiveFilters = filters.bodyFilter || filters.headerKey || filters.headerValue;

  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
      {/* Header con botón de expandir */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Filtros y Ordenamiento</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Activo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </div>

      {/* Ordenamiento siempre visible */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-400">Ordenar por:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="timestamp">Fecha/Hora</option>
          <option value="id">ID del Mensaje</option>
        </select>
        <Button
          onClick={toggleSort}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white p-1"
        >
          {filters.sortOrder === 'asc' ? (
            <SortAsc className="h-3 w-3" />
          ) : (
            <SortDesc className="h-3 w-3" />
          )}
        </Button>
        <span className="text-xs text-slate-500">
          {filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
        </span>
      </div>

      {/* Filtros expandibles */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-slate-600">
          {/* Filtro por contenido del mensaje */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Filtrar por contenido del mensaje
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
              <input
                type="text"
                value={filters.bodyFilter}
                onChange={(e) => updateFilter('bodyFilter', e.target.value)}
                placeholder="Buscar en el cuerpo del mensaje..."
                className="w-full pl-7 pr-3 py-1 bg-slate-600 border border-slate-500 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro por header específico */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Header (clave)
              </label>
              <input
                type="text"
                value={filters.headerKey}
                onChange={(e) => updateFilter('headerKey', e.target.value)}
                placeholder="Ej: orderId, customerId..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valor del header
              </label>
              <input
                type="text"
                value={filters.headerValue}
                onChange={(e) => updateFilter('headerValue', e.target.value)}
                placeholder="Valor a buscar..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-2">
            💡 Los filtros se aplican en tiempo real. Deja vacío para mostrar todos los mensajes.
          </div>
        </div>
      )}
    </div>
  );
}
