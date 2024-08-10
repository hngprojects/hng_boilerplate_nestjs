import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrganisationRoleDto } from './create-organisation-role.dto';
import { IsString } from 'class-validator';

export class UpdateOrganisationRoleDto extends PartialType(CreateOrganisationRoleDto) {}

export type AttachPermissionsDto = {
  roleId: string;
  permissions: string[];
};

export class AttachPermissionsApiBody {
  @ApiProperty({
    description: 'The role to be updated',
    example: 'some-id',
  })
  @IsString()
  roleId: string;

  @ApiProperty({
    description: 'Array of permissions to be attached',
    example: ['id', 's-id'],
  })
  permissions: string[];
}
