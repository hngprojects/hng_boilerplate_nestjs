import { IsOptional, IsString } from 'class-validator';
import { CreateEmailTemplateDto } from './create-email-template.dto';
import { IsHtml } from '../validators/html.validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailTemplateDto {
  @ApiProperty({ description: 'The name if the template', example: 'confirmation' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The subject of the template', example: 'Boilerplate Welcome Mail' })
  @IsOptional()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'The content of the template', example: '<h1></h1>' })
  @IsOptional()
  @IsString()
  @IsHtml({ message: 'content must be valid html' })
  content: string;
}
