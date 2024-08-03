import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLanguageDto {
  @ApiProperty({
    description: 'The name of the language',
    example: 'English',
  })
  @IsString()
  language: string;

  @ApiProperty({
    description: 'The language code',
    example: 'en',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'A description of the language',
    example: 'English Language',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateLanguageDto {
  @ApiProperty({
    description: 'The name of the language',
    example: 'English',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'The language code',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'A description of the language',
    example: 'English Language',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
