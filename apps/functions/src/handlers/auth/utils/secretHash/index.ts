import { createHmac } from 'node:crypto';
import { HMAC_ALGORITHM } from './constants.ts';

export const secretHash = (username: string, clientId: string, clientSecret: string): string =>
  createHmac(HMAC_ALGORITHM, clientSecret).update(`${username}${clientId}`).digest('base64');
