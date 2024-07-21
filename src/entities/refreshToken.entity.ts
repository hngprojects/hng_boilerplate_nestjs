import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  token: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: string;

  @Column({ nullable: false })
  expiryDate: Date;
}
