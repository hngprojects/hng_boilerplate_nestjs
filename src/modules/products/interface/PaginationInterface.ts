import { Product } from "../entities/product.entity";

export interface PaginationResult {
    products: Product[];
    success:boolean;
    message:string
    pagination: {
        totalItems: number,
        totalPages: number,
        currentPage: number
      },
    status_code:number
  }