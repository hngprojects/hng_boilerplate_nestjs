import { AbstractBaseEntity } from "../../../entities/base.entity";
import { Product } from "../../products/entities/product.entity";
import { Column, Entity, OneToMany,} from "typeorm";

@Entity('categories')
export class ProductCategory extends AbstractBaseEntity{
  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  slug: string

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
