import { JSON_CONTENT_TYPE } from './constants.ts';

export const isTrustedRequest = (
  headers: Record<string, string | undefined>,
  origin: string,
): boolean =>
  origin !== '' &&
  headers.origin === origin &&
  (headers['content-type'] ?? '').toLowerCase().startsWith(JSON_CONTENT_TYPE);
