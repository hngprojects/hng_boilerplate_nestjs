import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Comment extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  comment: string;

  @ManyToOne(() => Product, product => product.comments, { cascade: true })
  product: Product;

  @ManyToOne(() => User, user => user.comments, { cascade: true })
  user: User;

  @Column({ nullable: false })
  model_id: string;

  @Column()
  model_type: string;
}
