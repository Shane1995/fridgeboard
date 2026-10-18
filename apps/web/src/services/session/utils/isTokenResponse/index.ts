import type { ITokenResponse } from '@fridgeboard/contract/auth';

export const isTokenResponse = (value: unknown): value is ITokenResponse =>
  typeof value === 'object' &&
  value !== null &&
  'accessToken' in value &&
  typeof value.accessToken === 'string' &&
  value.accessToken !== '' &&
  'expiresIn' in value &&
  typeof value.expiresIn === 'number' &&
  Number.isFinite(value.expiresIn);
