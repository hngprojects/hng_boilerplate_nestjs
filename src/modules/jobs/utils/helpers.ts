export const isPassed = (date: string): boolean => {
  const strToDate: Date = new Date(date);
  const today = Date.now();
  return today > strToDate.getTime();
};
