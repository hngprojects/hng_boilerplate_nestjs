import { IsOptional, IsObject, ValidateNested, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPermissionListValid } from '../helpers/custom-validator';
import { Type } from 'class-transformer';
import { PermissionListDto } from './permission-list.dto';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'The title of the permission to be updated',
  })
  @IsString()
  title: string;
}

type UpdatePermissionOption = { id: string; permission: UpdatePermissionDto };
export default UpdatePermissionOption;
