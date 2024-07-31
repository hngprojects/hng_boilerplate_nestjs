import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { skipAuth } from '../helpers/skipAuth';
import { RunTestsService } from './run-tests.service';

@Controller('/run-tests')
export class RunTestsController {
  constructor(private readonly runTestsService: RunTestsService) {}
  @skipAuth()
  @Get()
  @Header('Content-Type', 'text/plain')
  runTests(@Res() res: Response) {
    return this.runTestsService.runTests(res);
  }
}
