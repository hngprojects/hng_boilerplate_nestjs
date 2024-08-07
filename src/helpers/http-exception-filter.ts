import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

export interface ExceptionResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            message: (exception as InternalServerErrorException).message || 'Internal server error',
            error: 'Internal Server Error',
          };

    const errorMessage =
      typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as ExceptionResponse).message;

    const error = typeof exceptionResponse === 'string' ? '' : (exceptionResponse as ExceptionResponse).error;

    response.status(status).json({
      status,
      error: error,
      message: errorMessage,
    });
  }
}
