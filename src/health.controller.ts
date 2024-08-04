import { Controller, Get } from '@nestjs/common';
import { skipAuth } from './helpers/skipAuth';

@Controller()
export default class HealthController {
  @skipAuth()
  @Get('/')
  public home() {
    return { status_code: 200, message: 'Welcome to NestJs Backend Endpoint ......' };
  }

  @skipAuth()
  @Get('health')
  public health() {
    return { message: 'This is a healthy endpoint', status_code: 200 };
  }
}
