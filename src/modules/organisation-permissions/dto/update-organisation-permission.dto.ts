import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationPermissionDto } from './create-organisation-permission.dto';

export class UpdateOrganisationPermissionDto extends PartialType(CreateOrganisationPermissionDto) {}
