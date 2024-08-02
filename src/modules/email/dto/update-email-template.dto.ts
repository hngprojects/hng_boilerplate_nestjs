import { IsOptional, IsString } from "class-validator";
import { CreateEmailTemplateDto } from "./create-email-template.dto";
import { IsHtml } from "../validators/html.validator";

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  @IsHtml({ message: 'content must be valid html' })
  content: string;
}