import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';

export enum StockStatusType {
  IN_STOCK = 'in stock',
  OUT_STOCK = 'out of stock',
  LOW_STOCK = 'low on stock',
}

export enum ProductSizeType {
  SMALL = 'Small',
  STANDARD = 'Standard',
  LARGE = 'Large',
}

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  price: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number;

  @Column({ nullable: true, default: false })
  is_deleted: boolean;

  @Column({
    type: 'enum',
    enum: ProductSizeType,
    default: ProductSizeType.STANDARD,
  })
  size: ProductSizeType;

  @Column({
    type: 'enum',
    enum: StockStatusType,
    default: StockStatusType.OUT_STOCK,
  })
  stock_status: StockStatusType;

  @ManyToOne(() => Organisation, org => org.products)
  org: Organisation;
}
