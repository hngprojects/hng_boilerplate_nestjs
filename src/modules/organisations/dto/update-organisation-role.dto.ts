import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsString()
  @IsNotEmpty()
  role: string;
}
