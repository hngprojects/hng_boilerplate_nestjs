import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHelpCenterDto {
  @ApiProperty({ description: 'Title of the help center topic' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'Content of the help center topic' })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
