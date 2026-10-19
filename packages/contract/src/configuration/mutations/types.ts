import type * as z from 'zod/mini';
import type { MutationEntrySchema } from './index.ts';
import type { MutationName } from './constants.ts';

export type MutationEntry = z.infer<typeof MutationEntrySchema>;

export type MutationEntries = Partial<Record<MutationName | 'default', MutationEntry>>;
