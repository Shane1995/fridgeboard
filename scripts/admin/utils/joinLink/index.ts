import { normaliseEmail } from '@fridgeboard/lambda-kit/utils/normaliseEmail/index.ts';
import { JOIN_URL } from './constants.ts';

export const joinLink = (email: string): string =>
  `${JOIN_URL}#email=${encodeURIComponent(normaliseEmail(email))}`;
