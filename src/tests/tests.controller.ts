import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('run-tests')
  runTests(@Res() res: Response) {
    const stream = this.testsService.runTests();
    stream.pipe(res);
  }
}
