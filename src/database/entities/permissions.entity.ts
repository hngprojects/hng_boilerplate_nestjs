import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Permissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;
}
