import { IsEmail, IsString } from 'class-validator';

export class OrganisationRequestDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly industry: string;

  @IsString()
  readonly type: string;

  @IsString()
  readonly country: string;

  @IsString()
  readonly address: string;

  @IsString()
  readonly state: string;
}
