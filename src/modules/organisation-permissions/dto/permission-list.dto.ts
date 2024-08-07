import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionCategory } from '../helpers/PermissionCategory';

export class PermissionListDto {
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

  @ApiProperty({ enum: PermissionCategory, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanGetProducts]?: boolean;
}
