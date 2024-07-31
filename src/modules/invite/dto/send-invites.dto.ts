import { IsUUID, IsArray, ArrayNotEmpty, IsEmail } from 'class-validator';

export class SendInvitesDto {
  @IsUUID()
  organizationId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
