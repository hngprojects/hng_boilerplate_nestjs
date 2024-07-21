// about_us_service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { CustomSections } from './custom-sections.entity';

@Entity()
export class AboutUsService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomSections, customSection => customSection.aboutUsServices)
  customSection: CustomSections;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
