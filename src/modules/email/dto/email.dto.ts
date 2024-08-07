import { IsEmail, IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email template name' })
  @IsNotEmpty()
  @IsString()
  template: string;

  @ApiProperty({ description: 'Context data for the email template', type: Object })
  @IsNotEmpty()
  @IsObject()
  context: object;
}

export class createTemplateDto {
  @ApiProperty({ description: 'Name of the template' })
  @IsString()
  templateName: string;

  @ApiProperty({ description: 'HTML content of the template' })
  @IsString()
  template: string;
}

export class UpdateTemplateDto {
  @ApiProperty({ description: 'Updated HTML content of the template' })
  @IsString()
  @IsNotEmpty()
  template: string;
}

export class getTemplateDto {
  @ApiProperty({ description: 'Name of the template to retrieve' })
  @IsString()
  templateName: string;
}
