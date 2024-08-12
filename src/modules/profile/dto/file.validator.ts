import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as fileType from 'file-type-mime';


export interface CustomUploadTypeValidatorOptions {
    fileType: string[];
  }
  
@Injectable()
export class FileValidator implements PipeTransform {
  constructor(private readonly options: { maxSize: number; mimeTypes: string[] }) {

  }

  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new CustomHttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    this.validateFileSize(value.size)
    await this.validateFileType(value.buffer)

    return value;
  }

  private validateFileSize(size: number) {
    if (size > this.options.maxSize) {
        throw new CustomHttpException(
        `File size exceeds ${this.options.maxSize / (1024 * 1024)}MB limit`,
        HttpStatus.BAD_REQUEST
      );
    }
  }


  private async validateFileType(buffer: Buffer) {
    const response = await fileType.parse(buffer);
    if (!response || !this.options.mimeTypes.includes(response.mime)) {
        throw new CustomHttpException(
        `Invalid file type. Allowed types: ${this.options.mimeTypes.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }


}
