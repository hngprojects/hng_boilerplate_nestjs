export function omit(obj: any, omitKeys: string[]) {
  const result: object = {};

  for (const key of Object.keys(obj)) {
    if (!omitKeys.includes(key)) result[key] = obj[key];
  }

  return result;
}
