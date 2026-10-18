import type { Key } from '../../types.ts';

export const hasKeys = (item: Key): boolean =>
  typeof item['PK'] === 'string' && typeof item['SK'] === 'string';
