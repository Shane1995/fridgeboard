import { createHash } from 'node:crypto';

export const subFromEmail = (email: string): string =>
  `local-${createHash('sha256').update(email).digest('hex').slice(0, 16)}`;
