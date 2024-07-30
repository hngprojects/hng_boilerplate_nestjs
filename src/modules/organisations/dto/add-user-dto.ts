import { IsString } from 'class-validator';

export class AddMemberToOrganisationDto {
  @IsString()
  readonly user_id: string;

  @IsString()
  readonly organisation_id: string;

  @IsString()
  readonly role: string;

  @IsString()
  readonly profile_id: string;
}

export class AddUserToOrganisationDto {
  @IsString()
  readonly userId: string;
}
