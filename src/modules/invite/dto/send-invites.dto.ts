import { IsUUID, IsArray, ArrayNotEmpty, IsEmail } from 'class-validator';

export class SendInvitesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
