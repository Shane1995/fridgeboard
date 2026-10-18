import { COOKIE_ATTRIBUTES } from './constants.ts';
import type { CookieName } from './types.ts';

export const serialiseCookie = (name: CookieName, value: string, maxAge: number): string =>
  `${name}=${value}; ${COOKIE_ATTRIBUTES}; Max-Age=${maxAge}`;

export const clearCookie = (name: CookieName): string => serialiseCookie(name, '', 0);

export const readCookie = (header: string[] | undefined, name: CookieName): string | undefined => {
  const prefix = `${name}=`;
  const value = (header ?? [])
    .flatMap((entry) => entry.split(';'))
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(prefix))
    ?.slice(prefix.length);
  return value || undefined;
};
