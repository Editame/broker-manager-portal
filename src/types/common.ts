export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}
