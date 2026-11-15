import type * as z from 'zod/mini';
import type { ListItemSchema } from '../../utils/items/listItem/index.ts';
import type { ListScope } from '../../utils/resolveList/types.ts';
import type { Table } from '../../utils/table/types.ts';

export type ListItemRow = z.infer<typeof ListItemSchema>;

export type QueryItemsOptions = { table: Table; scope: ListScope };

export type GetItemOptions = QueryItemsOptions & { itemId: string };

export type PutItemOpOptions = { scope: ListScope; item: ListItemRow };

export type ItemOpOptions = { scope: ListScope; itemId: string };

export type UpdateItemOpOptions = ItemOpOptions & { set: Record<string, unknown> };

export type SetItemShopsOpOptions = ItemOpOptions & { shopIds: string[] };
