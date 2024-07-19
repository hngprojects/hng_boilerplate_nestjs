import { v4 as uuid } from 'uuid';

export default class UUIDGenerator {
  public static generate(): string {
    const identifier = uuid();
    return identifier;
  }
}
