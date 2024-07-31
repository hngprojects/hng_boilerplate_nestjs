import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { Response } from 'express';

@Injectable()
export class RunTestsService {
  runTests(res: Response) {
    const process = spawn('python', ['src/tests/python.py']);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    process.stdout.on('data', data => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    process.stderr.on('data', data => {
      res.write(`data: Error: ${data.toString()}\n\n`);
    });

    process.on('close', data => {
      res.write(`data scriot exited with code ${data}\n\n`);
      res.end();
    });

    process.on('error', err => {
      res.write(`data: Error: ${err.message}\n\n`);
      res.end;
    });
  }
}
