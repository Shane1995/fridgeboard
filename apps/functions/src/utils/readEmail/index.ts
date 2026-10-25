import { INVITE_EMAIL_MAX_LENGTH } from '@fridgeboard/contract/households/constants';
import { normaliseEmail } from '../normaliseEmail/index.ts';
import { EMAIL_PATTERN } from './constants.ts';

export const readEmail = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const email = normaliseEmail(value);
  return email.length <= INVITE_EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email) ? email : undefined;
};
