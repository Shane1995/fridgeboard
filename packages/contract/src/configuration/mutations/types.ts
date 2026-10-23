import type * as z from 'zod/mini';
import type { MutationDefaultSchema, MutationEntriesSchema, MutationEntrySchema } from './index.ts';

export type MutationDefault = z.infer<typeof MutationDefaultSchema>;

export type MutationEntry = z.infer<typeof MutationEntrySchema>;

export type MutationEntries = z.infer<typeof MutationEntriesSchema>;
