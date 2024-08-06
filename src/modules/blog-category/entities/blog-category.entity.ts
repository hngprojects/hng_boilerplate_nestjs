import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('blog_categories')
export class BlogCategory extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
