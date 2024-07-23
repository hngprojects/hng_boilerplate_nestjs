import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: any) => this.responseHandler(res, context)),
      catchError((err: HttpException) => throwError(() => this.errorHandler(err, context)))
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse: any = exception.getResponse();

    let errorMessage = 'An error occurred';

    // Extract error message from exceptionResponse
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message.join(', ');
      } else {
        errorMessage = exceptionResponse.message;
      }
    }

    response.status(status).json({
      status: false,
      status_code: status,
      error: exceptionResponse.error || exceptionResponse,
      message: errorMessage,
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status_code = response.statusCode;

    const { message, ...data } = res;

    return {
      status: true,
      status_code,
      message,
      ...data,
    };
  }
}
