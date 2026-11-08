import type { BodySource } from '../readBodyField/types.ts';
import type { BodyObject } from './types.ts';

export const readBodyObject = (
  { body = '', isBase64Encoded }: BodySource,
  field: string,
): BodyObject | undefined => {
  const raw = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;
  try {
    const parsed: Record<string, unknown> = JSON.parse(raw) ?? {};
    const value = parsed[field];
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value))
      : undefined;
  } catch {
    return undefined;
  }
};
