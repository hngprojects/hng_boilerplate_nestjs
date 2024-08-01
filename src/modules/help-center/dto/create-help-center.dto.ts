import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHelpCenterDto {
  @ApiProperty({
    description: 'The title of the help center topic',
    example: 'How to reset your password',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The content of the help center topic',
    example: 'To reset your password, go to the settings page...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}