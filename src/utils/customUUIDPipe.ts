import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class CustomUUIDPipe extends ParseUUIDPipe implements PipeTransform<string> {
  async transform(value: string, metadata: ArgumentMetadata) {
    console.log(value);
    const trans = await super.transform(value, metadata);
    if (!trans) {
      throw new BadRequestException({
        success: false,
        message: 'ID should be a valid UUID',
        status_code: HttpStatus.BAD_REQUEST,
      });
    }

    return value;
  }
}
