import { MembershipItemSchema } from '../items/membershipItem/index.ts';
import { membershipQuery } from '../membershipQuery/index.ts';
import type { Table } from '../table/types.ts';

export const fetchMemberships = (table: Table, sub: string) =>
  table.query(membershipQuery(sub), MembershipItemSchema);
