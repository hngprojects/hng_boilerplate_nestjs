import { IsEmail, IsNotEmpty, IsString, IsObject } from 'class-validator';
import { IsHtml } from '../validators/html.validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  template: string;

  @IsNotEmpty()
  @IsObject()
  context: object;
}

export class getTemplateDto {
  @IsString()
  name: string;
}
