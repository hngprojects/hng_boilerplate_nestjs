import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  native_name?: string;

  @IsEnum(['LTR', 'RTL'])
  direction: 'LTR' | 'RTL';
}
