import type { ListScope } from '../resolveList/types.ts';
import type { Table } from '../table/types.ts';

export type ShopExistsOptions = { table: Table; scope: ListScope; shopId: string };
