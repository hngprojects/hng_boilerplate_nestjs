import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionCategory } from '../helpers/PermissionCategory';

export class PermissionListDto {
  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanViewTransactions]?: boolean;

  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanViewRefunds]?: boolean;

  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanLogRefunds]?: boolean;

  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanViewUsers]?: boolean;

  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanCreateUsers]?: boolean;

  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanEditUsers]?: boolean;

  @ApiProperty({ type: Boolean, description: 'Permission category' })
  @IsBoolean()
  [PermissionCategory.CanBlacklistWhitelistUsers]?: boolean;
}
