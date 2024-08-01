import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateOrganisationRoleDto {
  @ApiProperty({ description: 'The name of the role', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'The description of the role', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}
