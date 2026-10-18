import { COOKIE_ATTRIBUTES } from '../constants.ts';
import type { CookieName } from '../types.ts';

export const serialiseCookie = (name: CookieName, value: string, maxAge: number): string =>
  `${name}=${value}; ${COOKIE_ATTRIBUTES}; Max-Age=${maxAge}`;
