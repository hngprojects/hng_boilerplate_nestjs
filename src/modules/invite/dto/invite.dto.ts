import { IsString, IsUUID, IsEnum } from 'class-validator';

export class InviteDto {
  @IsUUID()
  id: string;

  @IsString()
  email: string;

  @IsEnum(['pending', 'approved', 'rejected'])
  status: string;
}
