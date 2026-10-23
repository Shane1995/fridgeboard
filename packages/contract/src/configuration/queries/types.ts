import type * as z from 'zod/mini';
import type { QueryDefaultSchema, QueryEntriesSchema, QueryEntrySchema } from './index.ts';

export type QueryDefault = z.infer<typeof QueryDefaultSchema>;

export type QueryEntry = z.infer<typeof QueryEntrySchema>;

export type QueryEntries = z.infer<typeof QueryEntriesSchema>;
