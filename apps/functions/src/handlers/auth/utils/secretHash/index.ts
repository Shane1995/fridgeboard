import { createHmac } from 'node:crypto';

export const secretHash = (username: string, clientId: string, clientSecret: string): string =>
  createHmac('sha256', clientSecret).update(`${username}${clientId}`).digest('base64');
