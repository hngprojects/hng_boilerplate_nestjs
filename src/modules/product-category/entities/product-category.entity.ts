import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class ProductCategory extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ length: 500 })
  @Index()
  name: string;

  @ApiProperty()
  @Column('text')
  @Index()
  description: string;

  @ApiProperty()
  @Column('text')
  slug: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
