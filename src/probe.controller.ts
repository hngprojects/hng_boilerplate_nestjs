import { Controller, Get } from '@nestjs/common';
import { skipAuth } from './helpers/skipAuth';

@Controller('/probe')
export default class ProbeController {
  @skipAuth()
  @Get('/')
  public test() {
    return { status_code: 200, message: 'I am the NestJs api responding' };
  }
}
