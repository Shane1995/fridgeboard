import { MembershipItemSchema } from '../../../utils/items/membershipItem/index.ts';
import { membershipQuery } from '../../../utils/membershipQuery/index.ts';
import type { Table } from '../../../utils/table/types.ts';

export const fetchMemberships = (table: Table, sub: string) =>
  table.query(membershipQuery(sub), MembershipItemSchema);
