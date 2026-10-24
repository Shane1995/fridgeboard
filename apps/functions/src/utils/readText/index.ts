import type { ReadTextOptions } from './types.ts';

export const readText = ({ value, maxLength }: ReadTextOptions): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : undefined;
};
