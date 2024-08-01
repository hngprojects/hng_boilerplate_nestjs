import { IsString } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../entities/organisations.entity';
import { Profile } from '../../profile/entities/profile.entity';

export class AddMemberToOrganisationDto {
  @IsString()
  readonly user_id: User;

  @IsString()
  readonly organisation_id: Organisation;

  @IsString()
  readonly role: string;

  @IsString()
  readonly profile_id: Profile;
}

export class AddUserToOrganisationDto {
  @IsString()
  readonly userId: string;
}
