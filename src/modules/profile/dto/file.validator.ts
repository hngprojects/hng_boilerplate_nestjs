import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidator implements PipeTransform {
  constructor(private readonly options: { maxSize: number; mimeTypes: string[] }) {}

  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('No file provided');
    }

    if (value.size > this.options.maxSize) {
      throw new BadRequestException(`File size exceeds ${this.options.maxSize / (1024 * 1024)}MB limit`);
    }

    if (!this.options.mimeTypes.includes(value.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${this.options.mimeTypes.join(', ')}`);
    }

    return value;
  }
}
