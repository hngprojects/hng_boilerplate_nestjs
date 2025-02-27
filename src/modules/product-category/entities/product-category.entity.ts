import { AbstractBaseEntity } from '@entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';

@Entity()
export class ProductCategory extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ type: 'text', unique: true })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;
}
