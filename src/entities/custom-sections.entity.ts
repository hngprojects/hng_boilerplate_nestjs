import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { AboutUs } from './about-us.entity';

@Entity()
export class CustomSections {
  [x: string]: any;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AboutUs, aboutUs => aboutUs.customSections)
  aboutUs: AboutUs;

  @Column()
  sectionType: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
