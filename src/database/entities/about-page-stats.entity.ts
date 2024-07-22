import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { CustomSections } from './custom-sections.entity';

@Entity()
export class AboutPageStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  yearsInBusiness: number;

  @Column('int')
  customers: number;

  @Column('int')
  monthlyBlogReaders: number;

  @Column('int')
  socialFollowers: number;

  @ManyToOne(() => CustomSections, customSection => customSection.aboutPageStats)
  customSection: CustomSections;

  @UpdateDateColumn()
  updatedAt: Date;
}
