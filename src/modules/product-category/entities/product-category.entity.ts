import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "src/entities/base.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class ProductCategory extends AbstractBaseEntity {
@ApiProperty()
@Column({type:'text', unique: true})
name:string

@ApiProperty()
@Column({type:'text', nullable: true})
description: string

@OneToMany(()=> Product, products => products.category)
product:Product
}
