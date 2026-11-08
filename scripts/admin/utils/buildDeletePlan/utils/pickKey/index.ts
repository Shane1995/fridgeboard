import type { Key } from '../../types.ts';

export const pickKey = (item: Key): Key => ({ PK: item['PK'], SK: item['SK'] });
