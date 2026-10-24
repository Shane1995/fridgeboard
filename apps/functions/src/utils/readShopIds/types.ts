import type { ListScope } from '../resolveList/types.ts';
import type { Table } from '../table/types.ts';

export type ReadShopIdsOptions = {
  fields: Record<string, unknown>;
  table: Table;
  scope: ListScope;
};

export type ReadShopIdsResult =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'ok'; shopIds: string[] };
