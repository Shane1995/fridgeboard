import type { IShop } from '@fridgeboard/contract/lists';
import type { ListScope } from '../../utils/resolveList/types.ts';
import type { Table } from '../../utils/table/types.ts';

export type QueryShopsOptions = { table: Table; scope: ListScope };

export type GetShopOptions = QueryShopsOptions & { shopId: string };

export type PutShopOpOptions = { scope: ListScope; shop: IShop };

export type ShopOpOptions = { scope: ListScope; shopId: string };

export type UpdateShopOpOptions = ShopOpOptions & { set: Record<string, unknown> };

export type SetShopOrderOpOptions = ShopOpOptions & { order: number };
