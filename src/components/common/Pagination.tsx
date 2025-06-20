import { Button } from '@/components/ui/Button';
import { PaginationState } from '@/types/common';

interface PaginationProps {
  paginationState: PaginationState;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({
  paginationState,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  const { currentPage, totalItems, itemsPerPage } = paginationState;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        Mostrando {startItem} a {endItem} de {totalItems} resultados
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
        >
          Anterior
        </Button>
        
        <span className="text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
