import { TOKEN_PREFIX } from '../constants.ts';
import type { LocalClaims } from '../types.ts';

export const encodeToken = (claims: LocalClaims): string =>
  `${TOKEN_PREFIX}${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
