import { Product } from '../../../modules/products/entities/product.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class ProductCategory extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ type: 'text', unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  slug: string

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  /* To be implemented in another pr */
  // @OneToMany(() => Product, product => product.category)
  // products: Product[];
}
