import { HttpException } from '@nestjs/common';

export default function CustomExceptionHandler(exception) {
  const { response, status } = exception;
  if (status !== 500) {
    throw new HttpException(response, status);
  }
}
