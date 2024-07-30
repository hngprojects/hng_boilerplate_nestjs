// import { ProductCategory } from '../../../modules/product-category/entities/product-category.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
// import { User } from '../../../modules/user/entities/user.entity';

export enum StockStatusType {
  IN_STOCK = 'in stock',
  OUT_STOCK = 'out of stock',
  LOW_STOCK = 'low on stock',
}

export enum StatusType {
  ACTIVE = 'active',
  DRAFT = 'draft',
}

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: StatusType, default: StatusType.ACTIVE })
  status: StatusType;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: StockStatusType,
    default: StockStatusType.OUT_STOCK,
  })
  stock_status: StockStatusType;

  @ManyToOne(() => Organisation, org => org.products)
  org: Organisation;

  // @ManyToOne(() => User, user => user.products)
  // user: User;

  /* To be implemented in another pr */
  // @ManyToOne(() => ProductCategory, category => category.products)
  // category: ProductCategory;
}
