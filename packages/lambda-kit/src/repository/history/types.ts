import type * as z from 'zod/mini';
import type { HistoryItemSchema } from '../../utils/items/historyItem/index.ts';
import type { ListScope } from '../../utils/resolveList/types.ts';
import type { Table } from '../../utils/table/types.ts';

export type HistoryRow = z.infer<typeof HistoryItemSchema>;

export type QueryHistoryOptions = { table: Table; scope: ListScope };

export type GetHistoryOptions = QueryHistoryOptions & { name: string };

export type HistoryOpOptions = { scope: ListScope; name: string; shopIds: string[] };
