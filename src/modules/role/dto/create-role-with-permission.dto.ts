import { ApiProperty } from '@nestjs/swagger';
import { CreateOrganisationRoleDto } from './create-organisation-role.dto';

export class CreateRoleWithPermissionDto {
  @ApiProperty({ description: 'The name of the role', maxLength: 50 })
  //   @IsString()
  //   @IsNotEmpty()
  //   @MaxLength(50)
  //   name: string;
  @ApiProperty({ description: 'The description of the role', maxLength: 200 })
  rolePayload: CreateOrganisationRoleDto;
  permissions_ids: string[];
}
