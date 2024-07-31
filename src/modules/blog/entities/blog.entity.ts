import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AbstractBaseEntity } from 'src/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Blog extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column()
  image_url: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.id)
  author: User;

  @Column({ default: true })
  is_Published: boolean;

  @ApiProperty({ type: Date, description: 'created_on of blog' })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_on: Date;

  @ApiProperty({ type: Date, description: 'modify_on of blog' })
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  modify_on: Date;
}
