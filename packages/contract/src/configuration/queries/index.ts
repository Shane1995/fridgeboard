import * as z from 'zod/mini';
import { DEFAULT_ENTRY, QUERY_BOUNDS, QUERY_NAMES } from './constants.ts';

const timeMs = z.int().check(z.gte(QUERY_BOUNDS.timeMs.min), z.lte(QUERY_BOUNDS.timeMs.max));

export const retryCount = z
  .int()
  .check(z.gte(QUERY_BOUNDS.retry.min), z.lte(QUERY_BOUNDS.retry.max));

export const QueryEntrySchema = z.strictObject({
  staleTimeMs: z.optional(timeMs),
  gcTimeMs: z.optional(timeMs),
  retry: z.optional(retryCount),
  refetchOnWindowFocus: z.optional(z.boolean()),
});

export const QueryEntriesSchema = z
  .partialRecord(z.enum([...QUERY_NAMES, DEFAULT_ENTRY]), QueryEntrySchema)
  .check(
    z.refine(
      (entries) => (entries.me?.staleTimeMs ?? 0) <= QUERY_BOUNDS.meStaleTimeMs.max,
      'me staleTimeMs exceeds the allowed maximum',
    ),
  );
