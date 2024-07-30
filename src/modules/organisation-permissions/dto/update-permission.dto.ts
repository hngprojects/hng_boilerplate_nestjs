import { IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPermissionListValid } from '../helpers/custom-validator';
import { Type } from 'class-transformer';
import { PermissionListDto } from './permission-list.dto';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Object containing permission categories and their boolean values',
    type: PermissionListDto,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionListDto)
  @IsPermissionListValid({ message: 'Invalid permission list structure' })
  permission_list: PermissionListDto;
}
