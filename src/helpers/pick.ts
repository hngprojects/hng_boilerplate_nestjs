export function pick(obj: any, keys: string[]) {
  const result: object = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}
