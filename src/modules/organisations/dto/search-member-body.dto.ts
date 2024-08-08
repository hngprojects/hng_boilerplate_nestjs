import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchMemberBodyDto {
  @ApiProperty({ type: String })
  @IsString()
  search_term: string;
}
