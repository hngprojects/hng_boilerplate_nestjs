import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class DeleteProductDTO {
  @ApiPropertyOptional({
    description: 'User id of current user',
    example: 'some-uuid',
  })
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Organisation id of current user',
    example: 'some-uuid',
  })
  @IsUUID()
  organisationId?: string;
}
