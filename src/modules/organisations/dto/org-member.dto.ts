import { IsUUID, IsNotEmpty } from 'class-validator';

export class RemoveOrganisationMemberDto {
  @IsUUID()
  userId?: string;

  @IsUUID()
  organisationId?: string;
}
