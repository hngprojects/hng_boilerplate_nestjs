import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { CustomSections } from './custom-sections.entity';

@Entity()
export class AboutPageStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomSections, customSection => customSection.aboutPageStats)
  customSection: CustomSections;

  @Column('int')
  yearsInBusiness: number;

  @Column('int')
  customers: number;

  @Column('int')
  monthlyBlogReaders: number;

  @Column('int')
  socialFollowers: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
