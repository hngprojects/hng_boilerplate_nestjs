import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
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
    if (exception instanceof HttpException) return exception;
    return new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status = response.statusCode;

    response.setHeader('Content-Type', 'application/json');
    if (typeof res === 'object') {
      const { message, ...data } = res;

      return {
        status,
        message,
        ...data,
      };
    } else {
      return res;
    }
  }
}
