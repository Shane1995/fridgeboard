import type { BodyField, BodySource } from './types.ts';

export const readBodyField = (
  { body = '', isBase64Encoded }: BodySource,
  field: BodyField,
): string => {
  const raw = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;
  try {
    const parsed: Partial<Record<BodyField, unknown>> = JSON.parse(raw) ?? {};
    const value = parsed[field];
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
};
