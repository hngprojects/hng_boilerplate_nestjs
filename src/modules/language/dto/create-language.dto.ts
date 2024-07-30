import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { DirectionEnum } from './direction.enum';
import { ApiProperty } from '@nestjs/swagger';
export class CreateLanguageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  native_name?: string;

  @IsEnum(DirectionEnum, { message: 'direction must be one of the following values: LTR, RTL' })
  direction: 'LTR' | 'RTL';
}
