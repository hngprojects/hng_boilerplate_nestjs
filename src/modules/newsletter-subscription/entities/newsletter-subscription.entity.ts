import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('newsletters')
export class NewsletterSubscription extends AbstractBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ default: false })
  isUnsubscribed: boolean;

  @Column({ default: 'inactive' }) // inactive, active, unsubscribed
  status: string;
}
