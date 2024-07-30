import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ContactUs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false })
  name: string;

  @Column('varchar', { nullable: false })
  email: string;

  @Column('text', { nullable: false })
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
