import * as crypto from 'crypto';

export function generateSixDigitToken(): string {
  const min = 100000;
  const max = 999999;
  const range = max - min + 1;
  const randomNumber = (crypto.randomBytes(3).readUIntBE(0, 3) % range) + min;
  return randomNumber.toString();
}
