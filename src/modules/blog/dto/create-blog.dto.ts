import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateBlogPost {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  category_id?: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty()
  @IsOptional()
  image_url: [];

  user: User;
}
