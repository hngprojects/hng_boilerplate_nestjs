import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateLanguageDto } from './create-language.dto';

export class fetchLanguageResponseDto {
  @ApiProperty()
  status_code: string;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: () => [CreateLanguageDto] })
  @Type(() => CreateLanguageDto)
  language: CreateLanguageDto[];
}
