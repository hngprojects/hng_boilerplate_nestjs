import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column('text')
  description: string;

  @Column({ length: 255 })
  category: string;

  @Column('text', { array: true })
  tags: string[];

  @Column('tsvector', { select: false })
  fullTextSearch: string;
}
