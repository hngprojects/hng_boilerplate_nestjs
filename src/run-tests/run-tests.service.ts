import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class RunTestsService {
  runTests(res) {
    const python = spawn('python', [process.cwd() + '\\src\\run-tests\\python.py']);

    res.set('Content-Type', 'text/plain');
    python.stdout.pipe(res);
    python.stderr.pipe(res);

    python.on('close', code => {
      res.end(`child process exited with code ${code}`);
    });
  }
}
