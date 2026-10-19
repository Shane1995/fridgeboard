import { BEARER_PATTERN } from './constants.ts';

export const bearerToken = (headers: Record<string, string | undefined>): string | undefined =>
  BEARER_PATTERN.exec(headers.authorization ?? '')?.[1];
