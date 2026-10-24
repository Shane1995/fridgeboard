import { ADMIN_EMAIL, ADMIN_GROUP } from '../constants.ts';
import { subFromEmail } from '../subFromEmail/index.ts';
import type { LocalClaims } from '../types.ts';

export const claimsFor = (email: string): LocalClaims => ({
  sub: subFromEmail(email),
  email,
  groups: email === ADMIN_EMAIL ? [ADMIN_GROUP] : [],
});
