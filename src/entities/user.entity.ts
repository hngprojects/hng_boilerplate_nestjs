import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HelpCenterTopic } from './help-center-topic.entity';
import { Organisation } from './organisation.entity';
import { Product } from './product.entity';
import { Profile } from './profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  is_active: boolean;

  @Column({ nullable: true })
  attempts_left: number;

  @Column({ nullable: true })
  time_left: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Product, product => product.user, { cascade: true })
  products: Product[];

  @ManyToMany(() => Organisation, organisation => organisation.users, { cascade: true })
  @JoinTable({
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organisation_org_id', referencedColumnName: 'org_id' },
  })
  organisations: Organisation[];

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => HelpCenterTopic, helpCenterTopic => helpCenterTopic.user, { eager: true })
  helpCenterTopics: HelpCenterTopic[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
