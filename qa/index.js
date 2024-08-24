const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const resultFilePath = path.resolve(__dirname, 'boilerplate_report.json');

const postmanApiKey = process.env.POSTMAN_API_KEY;

const runTasks = async () => {
  try {
    console.log('Generating test reports...');

    // Spawn a new process for running Newman tests
    const newmanProcess = spawn('npx', [
      'newman',
      'run',
      `https://api.getpostman.com/collections/37678338-3145218a-98a5-49f6-87be-18ec1ca6e0db?apikey=${postmanApiKey}`,
      '-e',
      `https://api.getpostman.com/environments/37678338-5b07d664-877b-40d0-ae8f-fddc791af401?apikey=${postmanApiKey}`,
      '--reporters',
      'cli,json',
      '--reporter-json-export',
      resultFilePath,
    ]);

    // Handle stdout
    newmanProcess.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    // Handle stderr
    newmanProcess.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    // Handle process close
    newmanProcess.on('close', code => {
      if (code !== 0) {
        console.warn(`Newman process exited with code ${code}. There may be test failures.`);
      }
      console.log('Finished running tests and generating reports');

      // Spawn a new process for compressing the report and making API requests
      console.log('Running test result compression and API request...');

      const compressProcess = spawn('node', ['compress_send.js']);

      compressProcess.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
      });

      compressProcess.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
      });

      compressProcess.on('close', code => {
        if (code !== 0) {
          console.error(`Compression process exited with code ${code}`);
          return;
        }
        console.log('Finished compressing test results and making API requests');

        // Remove the result.json file after successful compression
        fs.unlink(resultFilePath, err => {
          if (err) {
            console.error(`Error removing result.json: ${err.message}`);
            return;
          }
          console.log('Successfully removed result.json');
        });
      });
    });
  } catch (error) {
    console.error(`Error executing commands: ${error.message}`);
    console.log(error.stack);
  }
};

runTasks();
