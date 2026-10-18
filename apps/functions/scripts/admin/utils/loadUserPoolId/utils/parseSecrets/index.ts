import { INVALID_SECRETS_ERROR } from '../../constants.ts';
import type { ParsedSecrets } from './types.ts';

export const parseSecrets = (value: string): ParsedSecrets => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(INVALID_SECRETS_ERROR);
  }
};
