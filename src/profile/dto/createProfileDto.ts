import { IsNumberString, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsNumberString()
  phone: number;

  @IsString()
  avatar_url: string;
}
