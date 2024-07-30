import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';

export enum ProductStatusType {
  IN_STOCK = 'in stock',
  OUT_STOCK = 'out of stock',
  LOW_STOCK = 'low on stock',
}

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;
  
  @Column('int')
  quantity: number;
  
  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: ProductStatusType,
    default: ProductStatusType.OUT_STOCK,
  })
  satus: ProductStatusType;

  @ManyToOne(() => Organisation, org => org.products)
  org: Organisation;

  /* To be implemented in another pr */
  // @ManyToOne(() => ProductCategory, category => category.products)
  // category: ProductCategory;
}

