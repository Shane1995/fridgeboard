import type * as z from 'zod/mini';
import type { QueryEntriesSchema, QueryEntrySchema } from '.';

export type QueryEntry = z.infer<typeof QueryEntrySchema>;

export type QueryEntries = z.infer<typeof QueryEntriesSchema>;
