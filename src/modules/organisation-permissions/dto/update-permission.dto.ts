import { IsBoolean, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPermissionListValid } from '../helpers/custom-validator';
import { PermissionCategory } from '../helpers/PermissionCategory';
import { Type } from 'class-transformer';

class PermissionListDto {
  [x: string]: any;
  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanViewTransactions]?: boolean;

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanViewRefunds]?: boolean;

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanLogRefunds]?: boolean;

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanViewUsers]?: boolean;

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanCreateUsers]?: boolean;

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanEditUsers]?: boolean;

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanBlacklistWhitelistUsers]?: boolean;
}

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
