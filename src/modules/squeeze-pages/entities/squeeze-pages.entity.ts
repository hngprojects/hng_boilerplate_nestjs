import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'squeeze_pages' })
export class SqueezePage extends AbstractBaseEntity {
  @Column({ nullable: false, unique: true })
  page_title: string;

  @Column({ nullable: false })
  url_slug: string;

  @Column({ nullable: false })
  headline: string;

  @Column({ nullable: false })
  sub_headline: string;

  @Column({ nullable: false })
  body: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: false, default: false })
  status: boolean;
}
