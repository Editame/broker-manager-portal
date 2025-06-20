import { useState, useMemo } from 'react';
import { PaginationState } from '@/types/common';

export function usePagination<T>(items: T[], itemsPerPage: number = 15) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationState: PaginationState = {
    currentPage,
    itemsPerPage,
    totalItems: items.length,
  };

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const resetPage = () => setCurrentPage(1);

  return {
    paginatedItems,
    paginationState,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
