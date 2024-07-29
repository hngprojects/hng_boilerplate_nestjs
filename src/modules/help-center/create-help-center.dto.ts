import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHelpCenterDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
