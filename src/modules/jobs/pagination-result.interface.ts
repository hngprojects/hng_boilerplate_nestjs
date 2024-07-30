export interface PaginationResult<T> {
    message: string;
    data: T[];
    pagination: {
      current_page: number;
      total_pages: number;
      page_size: number;
      total_items: number;
    };
  }
  