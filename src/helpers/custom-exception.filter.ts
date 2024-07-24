import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const customResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { status: 'Internal Server Error', message: 'An unexpected error occurred' };

    response.status(status).json({
      status: typeof customResponse === 'string' ? customResponse : (customResponse as any).status || 'error',
      message: typeof customResponse === 'string' ? customResponse : (customResponse as any).message || 'error',
      status_code: status,
    });
  }
}
