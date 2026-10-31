import { TOKEN_PREFIX } from '../constants.ts';
import type { LocalClaims } from '../types.ts';

export const decodeToken = (token: string | undefined): LocalClaims | undefined => {
  if (!token?.startsWith(TOKEN_PREFIX)) {
    return undefined;
  }
  try {
    const parsed: Partial<LocalClaims> = JSON.parse(
      Buffer.from(token.slice(TOKEN_PREFIX.length), 'base64url').toString(),
    );
    return typeof parsed.sub === 'string' &&
      typeof parsed.email === 'string' &&
      Array.isArray(parsed.groups)
      ? { sub: parsed.sub, email: parsed.email, groups: parsed.groups }
      : undefined;
  } catch {
    return undefined;
  }
};
