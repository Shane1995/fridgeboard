import { MembershipItemSchema } from '../../../utils/items/membershipItem/index.ts';
import { membershipKey } from '../../../utils/keys/membershipKey/index.ts';
import type { IsMemberOptions } from './types.ts';

export const isMember = async ({ table, householdId, sub }: IsMemberOptions): Promise<boolean> => {
  const { PK, SK } = membershipKey(householdId, sub);
  return (await table.get({ PK, SK }, MembershipItemSchema)) !== undefined;
};
