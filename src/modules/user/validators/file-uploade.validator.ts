import { FileValidator } from '@nestjs/common';
import * as fileType from 'file-type-mime';
import { UPLOAD_UNSUPPORTED_FORMAT } from '../../../helpers/SystemMessages';

export interface CustomUploadTypeValidatorOptions {
  fileType: string[];
}

export class CustomUploadFileTypeValidator extends FileValidator {
  private _allowedMimeTypes: string[];

  constructor(protected readonly validationOptions: CustomUploadTypeValidatorOptions) {
    super(validationOptions);
    this._allowedMimeTypes = this.validationOptions.fileType;
  }

  public isValid(file?: any): boolean {
    const response = fileType.parse(file.buffer);
    return this._allowedMimeTypes.includes(response.mime);
  }

  public buildErrorMessage(): string {
    return UPLOAD_UNSUPPORTED_FORMAT(this._allowedMimeTypes.join(', '));
  }
}
