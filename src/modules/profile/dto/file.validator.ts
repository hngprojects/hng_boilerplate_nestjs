import { PipeTransform, Injectable, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as fileType from 'file-type-mime';
import { FILE_EXCEEDS_SIZE, INVALID_FILE_TYPE } from '../../../helpers/SystemMessages';


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
        FILE_EXCEEDS_SIZE(this.options.maxSize / (1024 * 1024)),
        HttpStatus.BAD_REQUEST
      );
    }
  }


  private async validateFileType(buffer: Buffer) {
    const response = await fileType.parse(buffer);
    if (!response || !this.options.mimeTypes.includes(response.mime)) {
        throw new CustomHttpException(
        INVALID_FILE_TYPE(this.options.mimeTypes.join(', ')),
        HttpStatus.BAD_REQUEST
      );
    }
  }


}
