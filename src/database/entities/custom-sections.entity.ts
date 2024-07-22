import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, OneToMany } from 'typeorm';
import { AboutUs } from './about-us.entity';
import { AboutPageStats } from './about-page-stats.entity';
import { AboutUsService } from './about-us-services.entity';

@Entity()
export class CustomSections {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AboutUs, aboutUs => aboutUs.customSections)
  aboutUs: AboutUs;

  @OneToMany(() => AboutPageStats, aboutPageStats => aboutPageStats.customSection)
  aboutPageStats: AboutPageStats[];

  @OneToMany(() => AboutUsService, aboutUsServices => aboutUsServices.customSection)
  aboutUsServices: AboutUsService[];

  @Column()
  sectionType: string;
  x;

  @UpdateDateColumn()
  updatedAt: Date;
}
