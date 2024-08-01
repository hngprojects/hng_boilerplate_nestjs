import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

export enum ProductSizeType {
  SMALL = 'Small',
  STANDARD = 'Standard',
  LARGE = 'Large',
}

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProductSizeType,
    default: ProductSizeType.STANDARD,
  })
  size: ProductSizeType;

  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  price: number;

  @ManyToOne(() => Product, product => product.variants, { onDelete: 'CASCADE' })
  product: Product;
}
