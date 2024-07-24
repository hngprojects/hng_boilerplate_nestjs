import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { DirectionEnum } from './direction.enum';

export class CreateLanguageDto {
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
