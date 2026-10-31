import { COOKIE_PATH } from '../constants.ts';

// Production cookies are Secure; Safari refuses those on http://localhost.
export const localCookie = (name: string, value: string, maxAge: number): string =>
  `${name}=${value}; HttpOnly; SameSite=Strict; Path=${COOKIE_PATH}; Max-Age=${maxAge}`;
