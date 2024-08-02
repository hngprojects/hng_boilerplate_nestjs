import { IsNotEmpty, IsString } from "class-validator";
import { IsHtml } from "../validators/html.validator";

export class CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  @IsHtml({ message: 'content must be valid html' })
  content: string;
}