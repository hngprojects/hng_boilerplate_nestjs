import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  requestName: string;

  @IsString()
  requestUrl: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsInt()
  responseTime: number;

  @IsInt()
  statusCode: number;

  @IsArray()
  errors: string[];
}
