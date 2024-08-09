import { IsArray, IsEmail, IsNotEmpty, IsUUID, ArrayNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsUUID()
  @IsNotEmpty()
  org_id: string;
}
