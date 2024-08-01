import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchHelpCenterDto {
  @ApiPropertyOptional({
    description: 'The title of the help center topic to search for',
    example: 'Help Topic Title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'The content of the help center topic to search for',
    example: 'Detailed content of the help topic',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
