import { IsString } from 'class-validator';

export class AddUserDto {
  @IsString()
  readonly userId: string;
}
