import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from '../product-category/entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationResult } from './PaginationInterface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>

  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findOneBy({ id: createProductDto.categoryId });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });

    return await this.productRepository.save(product);
  }
  
  async findAll(page:number = 1, limit:number =5):Promise<PaginationResult>{
    const [products, totalCount] = await this.productRepository.findAndCount({
      take:limit,
      skip: limit * (page - 1)
    })
    if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 0)) {
      throw new BadRequestException({
        "status": "bad request",
        "message": "Invalid query params passed",
        "status_code": 400
      });
    }
    if (page !== undefined && (isNaN(Number(page)) || Number(page) < 0)) {
      throw new BadRequestException({
        status: "bad request",
        message: "Invalid query params passed",
        status_code: 400
      });
    }

    const totalPages = Math.ceil(totalCount / limit);
    return {
      success: true,
      message: "Product retrieved successfully",
      products:products,
      pagination: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page
      },
    status_code: 200
    };
}
}
