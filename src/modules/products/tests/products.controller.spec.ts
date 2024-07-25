import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService} from '../products.service';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

// describe('ProductsController', () => {
//   let controller: ProductsController;
//   let productsService: ProductsService;
//   let repository: Repository<Product>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ProductsController],
//       providers: [{
//         provide: ProductsService,
//         useValue: {
//           findAll: jest.fn().mockResolvedValue({
//             products: [],
//           }),
//         },
//       }],
//     }).compile();

//     productsService = module.get<ProductsService>(ProductsService);
//     repository = module.get<Repository<Product>>(getRepositoryToken(Product));
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return paginated products and metadata', async () => {
//       const page = 1;
//       const limit = 5;
//       const products:Product[] = [
//       {
//         id: "0c6091f0-6759-4e3d-a2c0-6c982ca9e139",
//         product_name: "Homes Collection",
//         description: "This is a detailed description of the product for Homes collection",
//         quantity: 30,
//         price: 400,
//         user: {
//           first_name: '',
//           last_name: '',
//           email: '',
//           password: '',
//           is_active: false,
//           attempts_left: 0,
//           time_left: 0,
//           user_type: "/Users/a0000/Desktop/HNG11/stage4-hng-task-current/hng_boilerplate_nestjs/src/modules/user/entities/user.entity".SUPER_ADMIN,
//           owned_organisations: [],
//           created_organisations: [],
//           products: [],
//           hashPassword: function (): Promise<void> {
//             throw new Error('Function not implemented.');
//           },
//           id: '',
//           created_at: undefined,
//           updated_at: undefined
//         },
//         category: {
//           name: '',
//           description: '',
//           product: new Product,
//           id: '',
//           created_at: undefined,
//           updated_at: undefined
//         },
//         created_at: undefined,
//         updated_at: undefined
//       }
//       ];
//       const totalCount = 10;

//       jest.spyOn(repository, 'findAndCount').mockResolvedValue([products, totalCount]);

//       const result = await productsService.findAll(page, limit);

//       expect(result).toEqual({
//         products,
//         totalCount,
//         totalPages: Math.ceil(totalCount / limit),
//         currentPage: page,
//       });
//       expect(repository.findAndCount).toHaveBeenCalledWith({
//         take: limit,
//         skip: limit * (page - 1),
//       });
//     });
// });

// })



  

