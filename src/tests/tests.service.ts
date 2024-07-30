import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { Readable } from 'stream';

@Injectable()
export class TestsService {
  runTests(): Readable {
    const process = spawn('python', ['path/to/your/script.py']);
    return process.stdout;
  }
}
