import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from '../product-category/entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationQueryDto } from './dto/ PaginationQueryDto';
import { error } from 'console';

@Injectable()
export class ProductsService {
  productsRepo: any;
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>
  ) {}
  async findAll(paginationQuery: PaginationQueryDto){
    const { limit, page } = paginationQuery;
    const offset = limit * (page - 1); // Calculate offset
    const products=  await this.productRepository.find({
      skip: offset, // Skip the offset number of records
      take: limit,  // Take the limit number of records
    });
      const totalPage = products.length / limit
    if(products.length === 0 ){
      throw new NotFoundException({message: 'Product does not exist', status_code:400})
    }
    return ({
      
        success: true,
        "message": "Product retrieved successfully",
        "products": [...products],
        "pagination": {
          "totalItems": products.length,
          "totalPages": totalPage,
          "currentPage": page
        },
      "status_code": 200
      
    })
  }
}