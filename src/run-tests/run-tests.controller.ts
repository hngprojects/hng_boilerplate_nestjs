import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { skipAuth } from '../helpers/skipAuth';
import { RunTestsService } from './run-tests.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('/run-tests')
export class RunTestsController {
  constructor(private readonly runTestsService: RunTestsService) {}
  @skipAuth()
  @Get()
  @ApiOperation({
    description:
      'This PR extends the functionality of the NestJS application\
    by integrating a Python script for running compatibility tests. The script is executed via\
    a new API endpoint, and the output is streamed to the user on the browser.',
  })
  @Header('Content-Type', 'text/plain')
  runTests(@Res() res: Response) {
    return this.runTestsService.runTests(res);
  }
}
