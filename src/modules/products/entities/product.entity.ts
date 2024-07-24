import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { ProductCategory } from "src/modules/product-category/entities/product-category.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
@Entity()
export class Product extends AbstractBaseEntity {
@ApiProperty()
@Column({type: 'text'})
productName: string;

@ApiProperty()
@Column('text')
description: string;

@ApiProperty()
@Column({type: 'int'})
quantity: number;

@ApiProperty()
@Column({type: 'int'})
price: number

@ManyToOne(()=> User, user => user.products)
user: User;

@ManyToOne(()=> ProductCategory, category => category.product)
category: ProductCategory[]

}
