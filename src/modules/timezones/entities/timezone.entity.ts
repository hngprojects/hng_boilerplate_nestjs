import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Timezone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  timezone: string;

  @Column()
  gmtOffset: string;

  @Column({ nullable: true })
  description?: string;
}
