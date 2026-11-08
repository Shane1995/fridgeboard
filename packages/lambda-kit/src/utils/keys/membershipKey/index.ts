import { HOUSEHOLD_PK_PREFIX, MEMBER_SK_PREFIX } from '../constants.ts';
import { membershipGsiKey } from '../membershipGsiKey/index.ts';
import type { MembershipKey } from '../types.ts';

export const membershipKey = (householdId: string, sub: string): MembershipKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${MEMBER_SK_PREFIX}${sub}`,
  ...membershipGsiKey(sub),
  GSI1SK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
});
