import { IsString } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
