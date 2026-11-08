import type { ListScope } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import type { Table } from '@fridgeboard/lambda-kit/utils/table/types.ts';

export type ReadShopIdsOptions = {
  fields: Record<string, unknown>;
  table: Table;
  scope: ListScope;
};

export type ReadShopIdsResult =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'ok'; shopIds: string[] };
