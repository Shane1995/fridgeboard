import * as z from 'zod/mini';
import { RequestTimeoutSchema } from '../requestTimeout/index.ts';
import { QUERY_BOUNDS } from './constants.ts';

const timeMs = z.int().check(z.gte(QUERY_BOUNDS.timeMs.min), z.lte(QUERY_BOUNDS.timeMs.max));

export const retryCount = z
  .int()
  .check(z.gte(QUERY_BOUNDS.retry.min), z.lte(QUERY_BOUNDS.retry.max));

export const QueryDefaultSchema = z.strictObject({
  gcTimeMs: timeMs,
  refetchOnWindowFocus: z.boolean(),
  retry: retryCount,
  staleTimeMs: timeMs,
  timeoutMs: RequestTimeoutSchema,
});

export const QueryEntrySchema = z.partial(QueryDefaultSchema);

export const QueryEntriesSchema = z
  .strictObject({
    default: QueryDefaultSchema,
    me: z.optional(QueryEntrySchema),
  })
  .check(
    z.refine(
      (entries) => (entries.me?.staleTimeMs ?? 0) <= QUERY_BOUNDS.meStaleTimeMs.max,
      'me staleTimeMs exceeds the allowed maximum',
    ),
  );
