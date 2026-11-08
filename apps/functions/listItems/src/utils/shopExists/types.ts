import type { ListScope } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import type { Table } from '@fridgeboard/lambda-kit/utils/table/types.ts';

export type ShopExistsOptions = { table: Table; scope: ListScope; shopId: string };
