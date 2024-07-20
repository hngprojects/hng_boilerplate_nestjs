import * as bcrypt from 'bcryptjs';

export const comparePasswords = async (password: string, userPassword: string) => {
  return await bcrypt.compare(password, userPassword);
};
