import * as bcrypt from 'bcrypt';

export default class Hash {
  private static saltRounds = 15;

  public static async make(password: string) {
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    return passwordHash;
  }

  public static async validate(password: string, passwordHash) {
    const passwordMatch = await bcrypt.compare(password, passwordHash);
  }
}
