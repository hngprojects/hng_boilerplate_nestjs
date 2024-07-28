import { IsString } from 'class-validator';

export class AddUserToOrganisationDto {
  @IsString()
  readonly userId: string;
}
