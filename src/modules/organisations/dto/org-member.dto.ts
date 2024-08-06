import { IsUUID, IsNotEmpty } from 'class-validator';

export class RemoveOrganisationMemberDto {
  @IsUUID()
  // @IsNotEmpty()
  userId?: string;

  @IsUUID()
  // @IsNotEmpty()
  organisationId?: string;
}
