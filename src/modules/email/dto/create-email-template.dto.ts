import { IsNotEmpty, IsString } from "class-validator";
import { IsHtml } from "../validators/html.validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEmailTemplateDto {
  @ApiProperty({description: 'The name if the template', example: 'confirmation'})
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({description: 'The subject of the template', example: 'Boilerplate Welcome Mail'})
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({description: 'The content of the template', example: '<h1></h1>'})
  @IsNotEmpty()
  @IsString()
  @IsHtml({ message: 'content must be valid html' })
  content: string;
}