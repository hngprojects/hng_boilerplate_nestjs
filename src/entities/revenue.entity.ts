import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Revenue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
