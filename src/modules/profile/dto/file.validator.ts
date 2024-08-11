import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

@Injectable()
export class FileValidator implements PipeTransform {
  constructor(private readonly options: { maxSize: number; mimeTypes: string[] }) {}

  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new CustomHttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    if (value.size > this.options.maxSize) {
      throw new CustomHttpException(
        `File size exceeds ${this.options.maxSize / (1024 * 1024)}MB limit`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!this.options.mimeTypes.includes(value.mimetype)) {
      throw new CustomHttpException(
        `Invalid file type. Allowed types: ${this.options.mimeTypes.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    return value;
  }
}
