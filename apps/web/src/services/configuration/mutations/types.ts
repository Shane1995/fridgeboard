import type * as z from 'zod/mini';
import type { MutationEntriesSchema, MutationEntrySchema } from '.';

export type MutationEntry = z.infer<typeof MutationEntrySchema>;

export type MutationEntries = z.infer<typeof MutationEntriesSchema>;
