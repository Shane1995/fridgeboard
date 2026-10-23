const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const findUnsortedKeys = (value: unknown, path = '$'): string[] => {
  if (!isRecord(value)) {
    return [];
  }
  const keys = Object.keys(value);
  const own =
    Array.isArray(value) || keys.every((key, i) => i === 0 || (keys[i - 1] ?? '') <= key)
      ? []
      : [`${path}: keys are not sorted`];
  return [...own, ...keys.flatMap((key) => findUnsortedKeys(value[key], `${path}.${key}`))];
};
