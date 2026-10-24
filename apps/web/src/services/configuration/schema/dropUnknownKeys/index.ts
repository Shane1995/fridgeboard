import type { DropUnknownKeysOptions } from './types';

export const dropUnknownKeys = ({ value, allowed }: DropUnknownKeysOptions): unknown =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).filter(([key]) => allowed.includes(key)))
    : value;
