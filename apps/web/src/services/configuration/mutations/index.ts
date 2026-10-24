import * as z from 'zod/mini';
import { RequestTimeoutSchema } from '../requestTimeout';
import { MUTATION_BOUNDS } from './constants';

const MutationDefaultSchema = z.strictObject({
  retry: z.int().check(z.gte(MUTATION_BOUNDS.retry.min), z.lte(MUTATION_BOUNDS.retry.max)),
  timeoutMs: RequestTimeoutSchema,
});

export const MutationEntrySchema = z.partial(MutationDefaultSchema);

export const MutationEntriesSchema = z.strictObject({
  default: MutationDefaultSchema,
  signOut: z.optional(MutationEntrySchema),
});
