import type { CookieName } from '../types.ts';

export const readCookie = (header: string[] | undefined, name: CookieName): string | undefined => {
  const prefix = `${name}=`;
  const value = (header ?? [])
    .flatMap((entry) => entry.split(';'))
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(prefix))
    ?.slice(prefix.length);
  return value || undefined;
};
