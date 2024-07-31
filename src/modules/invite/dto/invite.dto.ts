import { IsString, IsUUID, IsEnum } from 'class-validator';

export class InviteDto {
  @IsUUID()
  id: string;

  @IsString()
  link: string;

  @IsString()
  org_id: string;

  @IsEnum(['pending', 'approved', 'rejected'])
  status: string;
}
