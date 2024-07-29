import { IsString, ValidateNested, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class TemplateDTO {
  @IsString()
  name: string;

  @IsString()
  content: string;
}
class EmailResponseDataDTO {
  @IsNumber()
  total: number;
  @IsNumber()
  limit: number;
  @IsNumber()
  page: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateDTO)
  templates: TemplateDTO[];
}

export class EmailResponseDTO {
  @ValidateNested()
  @Type(() => EmailResponseDataDTO)
  data: EmailResponseDataDTO;
}
