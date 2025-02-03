import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';

@Entity('organization_user_role')
export class OrganisationUserRole extends AbstractBaseEntity {
  @Column()
  userId: string;

  @Column()
  roleId: string;

  @Column({ nullable: true })
  organisationId: string;

  @ManyToOne(() => Role)
  role: Role;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Organisation)
  organisation: Organisation;
}
