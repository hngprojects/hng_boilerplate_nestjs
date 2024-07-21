import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  feature: string;

  @Column({ nullable: false })
  description: string;
}
