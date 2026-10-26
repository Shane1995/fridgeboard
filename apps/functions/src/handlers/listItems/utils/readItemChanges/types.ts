import type { ListScope } from '../../../../utils/resolveList/types.ts';
import type { Table } from '../../../../utils/table/types.ts';
import type { ItemChanges } from '../../routes/update/types.ts';

export type ReadItemChangesOptions = {
  fields: Record<string, unknown>;
  table: Table;
  scope: ListScope;
};

export type ReadItemChangesResult =
  | { status: 'invalid'; reason: 'invalid-name' | 'invalid-shop' | 'invalid-request' }
  | { status: 'ok'; set: ItemChanges; shopsChanged: boolean };
