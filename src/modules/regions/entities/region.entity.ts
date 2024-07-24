import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Regions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  regionCode: string;

  @Column()
  regionName: string;

  @Column()
  countryCode: string;

  @Column('int')
  status: number;

  @Column({ type: 'timestamp' })
  createdOn: Date;

  @Column()
  createdBy: string;

  @Column({ type: 'timestamp' })
  modifiedOn: Date;

  @Column()
  modifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
