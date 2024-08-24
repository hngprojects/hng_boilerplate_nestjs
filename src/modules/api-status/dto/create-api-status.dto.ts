import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRequestDto } from './create-request.dto';

export class CreateApiStatusDto {
  @IsString()
  api_group: string;

  @IsString()
  status: string;

  @IsString()
  details: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestDto)
  requests: CreateRequestDto[];
}
