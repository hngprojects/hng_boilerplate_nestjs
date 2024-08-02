import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSqueezePageDto {
  @ApiProperty({
    example: 'Product Squeeze Page',
    description: 'The page title of the squeeze page',
    nullable: false,
    uniqueItems: true,
  })
  @IsString()
  @IsNotEmpty()
  page_title: string;

  @ApiProperty({
    example: 'product',
    description: 'The URL slug of the squeeze page',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  url_slug: string;

  @ApiProperty({
    example: 'Product Headline',
    description: 'The headline of the squeeze page',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  headline: string;

  @ApiProperty({
    example: 'Product Sub Headline',
    description: 'The sub headline of the squeeze page',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  sub_headline: string;

  @ApiProperty({
    example: 'Product Body',
    description: 'The body of the squeeze page',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    example: 'Product Image',
    description: 'The image of the squeeze page',
    nullable: true,
  })
  @IsOptional()
  image: string;
}
