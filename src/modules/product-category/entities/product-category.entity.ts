import { AbstractBaseEntity } from "../../../entities/base.entity";
import { Product } from "../../products/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// @Entity()
// export class ProductCategory extends AbstractBaseEntity {
// @Column({type:'text', unique: true})
// name:string
// @Column({type:'text', nullable: true})
// description: string
// @OneToMany(()=> Product, products => products.category)
// product:Product
// }

@Entity('categories')
export class ProductCategory extends AbstractBaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  slug: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
