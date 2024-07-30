import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Faq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false })
  answer: string;

  @Column({ nullable: false })
  category: string;

  @Column({ nullable: false, type: 'simple-array' })
  tags: string[];

  @Column({ nullable: false })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
