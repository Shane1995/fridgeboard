import type { ListScope } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import type { Table } from '@fridgeboard/lambda-kit/utils/table/types.ts';
import type { ItemChanges } from '../../routes/update/types.ts';

export type ReadItemChangesOptions = {
  fields: Record<string, unknown>;
  table: Table;
  scope: ListScope;
};

export type ReadItemChangesResult =
  | { status: 'invalid'; reason: 'invalid-name' | 'invalid-shop' | 'invalid-request' }
  | { status: 'ok'; set: ItemChanges; shopsChanged: boolean };
