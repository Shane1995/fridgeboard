import { randomBytes } from 'node:crypto';

const TIME_WIDTH = 9;

export const newId = (now = Date.now()): string =>
  `${now.toString(36).padStart(TIME_WIDTH, '0')}${randomBytes(6).toString('hex')}`;
