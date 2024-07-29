import { ProductCategory } from '../../../modules/product-category/entities/product-category.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

export enum StatusType {
  ACTIVE = 'active',
  DRAFT = 'draft',
}

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  product_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: StatusType, default: StatusType.ACTIVE })
  status: StatusType;

  @ManyToOne(() => User, user => user.products)
  user: User;

  @ManyToOne(() => ProductCategory, category => category.products)
  category: ProductCategory;
}
