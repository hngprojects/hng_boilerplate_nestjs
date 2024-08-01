import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaitlistPageDTO {
  @ApiProperty({ type: String })
  @IsString()
  page_title: string;

  @ApiProperty({ type: String })
  @IsString()
  url_slug: string;

  @ApiProperty({ type: String })
  @IsString()
  headline_text: string;

  @ApiProperty({ type: String })
  @IsString()
  sub_headline_text: string;

  @ApiProperty({ type: String })
  @IsString()
  body_text: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  image_url: string;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  status: boolean;
}
