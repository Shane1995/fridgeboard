import * as z from 'zod/mini';
import { DEFAULT_ENTRY } from '../queries/constants.ts';
import { retryCount } from '../queries/index.ts';
import { MUTATION_NAMES } from './constants.ts';

export const MutationEntrySchema = z.strictObject({
  retry: z.optional(retryCount),
});

export const MutationEntriesSchema = z.partialRecord(
  z.enum([...MUTATION_NAMES, DEFAULT_ENTRY]),
  MutationEntrySchema,
);
