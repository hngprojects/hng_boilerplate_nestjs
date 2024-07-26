import { AbstractBaseEntity } from "../../../entities/base.entity";
import { Product } from "../../products/entities/product.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
export class ProductCategory extends AbstractBaseEntity {
@Column({type:'text', unique: true})
name:string
@Column({type:'text', nullable: true})
description: string
@OneToMany(()=> Product, products => products.category)
product:Product
}
