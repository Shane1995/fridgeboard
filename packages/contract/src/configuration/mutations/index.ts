import * as z from 'zod/mini';
import { DEFAULT_ENTRY } from '../queries/constants.ts';
import { CONFIGURABLE_MUTATION_NAMES, MUTATION_BOUNDS } from './constants.ts';

export const MutationEntrySchema = z.strictObject({
  retry: z.optional(
    z.int().check(z.gte(MUTATION_BOUNDS.retry.min), z.lte(MUTATION_BOUNDS.retry.max)),
  ),
});

export const MutationEntriesSchema = z.partialRecord(
  z.enum([...CONFIGURABLE_MUTATION_NAMES, DEFAULT_ENTRY]),
  MutationEntrySchema,
);
