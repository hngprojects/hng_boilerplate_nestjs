import { ProductCategory } from "src/modules/product-category/entities/product-category.entity";


export const productCategoryMock: ProductCategory = {
  id: 'category-id-123', 
  name: 'Fashion', 
  description: '',
  products: [], 
  created_at: new Date(),
  updated_at: new Date(),
};
