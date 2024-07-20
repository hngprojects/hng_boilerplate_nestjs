import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  category: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column('tsvector', { select: false, nullable: true })
  fullTextSearch: string;

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }
}
