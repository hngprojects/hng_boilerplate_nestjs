import { ProductCategory } from '../../../modules/product-category/entities/product-category.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { ProductVariant } from './product-variant.entity';

export enum StockStatusType {
  IN_STOCK = 'in stock',
  OUT_STOCK = 'out of stock',
  LOW_STOCK = 'low on stock',
}

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: StockStatusType,
    default: StockStatusType.OUT_STOCK,
  })
  stock_status: StockStatusType;

  @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true, onDelete: 'CASCADE' })
  variants: ProductVariant[];

  @ManyToOne(() => Organisation, org => org.products)
  org: Organisation;

  /* To be implemented in another pr */
  // @ManyToOne(() => ProductCategory, category => category.products)
  // category: ProductCategory;
}
