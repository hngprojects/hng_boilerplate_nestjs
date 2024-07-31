import { IsEmail, IsNotEmpty, IsString, IsObject } from 'class-validator';

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

export class createTemplateDto {
  @IsString()
  filename: string;

  @IsString()
  template: string;
}

export class getTemplateDto {
  @IsString()
  templateName: string;
}
