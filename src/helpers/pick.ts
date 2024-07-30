export function pick(obj: object, keys: string[]) {
  const result: object = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}
