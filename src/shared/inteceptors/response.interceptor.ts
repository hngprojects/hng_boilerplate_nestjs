import {
  Logger,
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
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: any) => this.responseHandler(res, context)),
      catchError((err: unknown) => throwError(() => this.errorHandler(err, context)))
    );
  }

  errorHandler(exception: unknown, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (exception instanceof HttpException) return exception;
    this.logger.error(
      `Error processing request for ${req.method} ${req.url}, Message: ${exception['message']}, Stack: ${exception['stack']}`
    );
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
