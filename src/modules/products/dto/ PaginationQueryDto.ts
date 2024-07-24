import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // ensures the value is parsed as a number
  limit: number;

  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page: number;
}