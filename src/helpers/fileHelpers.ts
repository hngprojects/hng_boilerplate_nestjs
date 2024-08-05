import * as fs from 'fs';
import { promisify } from 'util';

/**
 * Check if a file or directory exists at a given path.
 */
export const checkIfFileOrDirectoryExists = (path: string): boolean => {
  return fs.existsSync(path);
};

/**
 * Gets file data from a given path via a promise interface.
 */
export const getFile = async (path: string, encoding?: BufferEncoding): Promise<string | Buffer> => {
  const readFile = promisify(fs.readFile);
  return encoding ? readFile(path, { encoding }) : readFile(path);
};

/**
 * Writes a file at a given path via a promise interface.
 */
export const createFile = async (path: string, fileName: string, data: string): Promise<void> => {
  if (!checkIfFileOrDirectoryExists(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  const writeFile = promisify(fs.writeFile);
  await writeFile(`${path}/${fileName}`, data, 'utf8');
};

/**
 * Deletes a file at the given path via a promise interface.
 */
export const deleteFile = async (path: string): Promise<void> => {
  const unlink = promisify(fs.unlink);
  await unlink(path);
};