import { ApiProperty } from '@nestjs/swagger';
import { HasMimeType, MaxFileSize } from 'nestjs-form-data';

export class UploadProfilePicDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture file',
    maxLength: 2 * 1024 * 1024, // 2MB
  })
  @HasMimeType(['image/jpeg', 'image/png', 'image/gif'])
  @MaxFileSize(2 * 1024 * 1024) // 2MB max file size
  file: Express.Multer.File;
}
