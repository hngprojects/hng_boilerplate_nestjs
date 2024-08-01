import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'waitlist-page' })
export class WaitlistPage extends AbstractBaseEntity {
  @Column({ nullable: false })
  page_title: string;

  @Column({ nullable: false })
  url_slug: string;

  @Column({ nullable: false })
  headline_text: string;

  @Column({ nullable: false })
  sub_headline_text: string;

  @Column({ nullable: true, type: 'text' })
  body_text: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true, default: false })
  status: boolean;
}
