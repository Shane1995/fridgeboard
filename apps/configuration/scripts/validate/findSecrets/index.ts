import { SECRET_KEY_PATTERN, SECRET_VALUE_PATTERNS } from '../constants.ts';

export const findSecrets = (value: unknown, path = '$'): string[] => {
  if (typeof value === 'string') {
    return SECRET_VALUE_PATTERNS.filter((pattern) => pattern.test(value)).map(
      () => `${path}: value looks like a credential`,
    );
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findSecrets(item, `${path}[${index}]`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => [
      ...(SECRET_KEY_PATTERN.test(key) ? [`${path}.${key}: key name suggests a secret`] : []),
      ...findSecrets(child, `${path}.${key}`),
    ]);
  }
  return [];
};
