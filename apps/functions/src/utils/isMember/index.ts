import { MembershipItemSchema } from '../items/membershipItem/index.ts';
import { membershipKey } from '../keys/membershipKey/index.ts';
import type { Table } from '../table/types.ts';

export const isMember = async (
  table: Table,
  householdId: string,
  sub: string,
): Promise<boolean> => {
  const { PK, SK } = membershipKey(householdId, sub);
  return (await table.get({ PK, SK }, MembershipItemSchema)) !== undefined;
};
