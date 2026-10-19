import type * as z from 'zod/mini';
import type { QueryEntrySchema } from './index.ts';
import type { QueryName } from './constants.ts';

export type QueryEntry = z.infer<typeof QueryEntrySchema>;

export type QueryEntries = Partial<Record<QueryName | 'default', QueryEntry>>;
