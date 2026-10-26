import * as z from 'zod/mini';
import { dropUnknownKeys } from '../dropUnknownKeys';
import {
  API_URL_PATTERN,
  ENDPOINT_PATH_PATTERN,
  EVENTS_HTTP_HOST_PATTERN,
  MUTATION_BOUNDS,
  QUERY_BOUNDS,
  REALTIME_HOST_PATTERN,
  REQUEST_TIMEOUT_BOUNDS,
  SAFE_URL_PATTERN,
  SETTING_BOUNDS,
  WEB_CONFIGURATION_VERSION,
  WEB_FEATURE_FLAGS,
  WEB_SERVICES,
} from '../constants';
import type { CreateWebConfigurationSchemasOptions } from './types';

const inRange = ({ min, max }: { min: number; max: number }) =>
  z.int().check(z.gte(min), z.lte(max));

// One set of shapes, built two ways. Strict refuses any key it does not know, which is what CI
// wants. Lenient drops unknown keys, so a tab running an older build still loads a newer
// configuration and just ignores what it does not understand.
export const createWebConfigurationSchemas = ({ strict }: CreateWebConfigurationSchemasOptions) => {
  const object = <Shape extends z.core.$ZodShape>(shape: Shape) =>
    strict ? z.strictObject(shape) : z.object(shape);

  const withoutUnknownKeys = (allowed: readonly string[]) => (input: unknown) =>
    strict ? input : dropUnknownKeys({ value: input, allowed });

  const RequestTimeoutSchema = inRange(REQUEST_TIMEOUT_BOUNDS);

  const MutationDefaultSchema = object({
    retry: inRange(MUTATION_BOUNDS.retry),
    timeoutMs: RequestTimeoutSchema,
  });

  const MutationEntrySchema = z.partial(MutationDefaultSchema);

  const MutationEntriesSchema = object({
    default: MutationDefaultSchema,
    signOut: z.optional(MutationEntrySchema),
  });

  const QueryDefaultSchema = object({
    gcTimeMs: inRange(QUERY_BOUNDS.timeMs),
    refetchOnWindowFocus: z.boolean(),
    retry: inRange(QUERY_BOUNDS.retry),
    staleTimeMs: inRange(QUERY_BOUNDS.timeMs),
    timeoutMs: RequestTimeoutSchema,
  });

  const QueryEntrySchema = z.partial(QueryDefaultSchema);

  const QueryEntriesSchema = object({
    default: QueryDefaultSchema,
    me: z.optional(QueryEntrySchema),
    onboarding: z.optional(QueryEntrySchema),
    households: z.optional(QueryEntrySchema),
  }).check(
    z.refine(
      (entries) => (entries.me?.staleTimeMs ?? 0) <= QUERY_BOUNDS.meStaleTimeMs.max,
      'me staleTimeMs exceeds the allowed maximum',
    ),
  );

  const endpointPath = z
    .string()
    .check(z.regex(API_URL_PATTERN), z.regex(ENDPOINT_PATH_PATTERN), z.regex(SAFE_URL_PATTERN));

  const EndpointConfigSchema = object({ timeoutMs: z.optional(RequestTimeoutSchema) });

  const ApiServiceSchema = object({
    endpoints: z.pipe(
      z.transform(withoutUnknownKeys(WEB_SERVICES)),
      z.record(z.enum(WEB_SERVICES), endpointPath),
    ),
    endpointsConfig: z.optional(
      z.pipe(
        z.transform(withoutUnknownKeys(WEB_SERVICES)),
        z.partialRecord(z.enum(WEB_SERVICES), EndpointConfigSchema),
      ),
    ),
  });

  const RealtimeServiceSchema = object({
    realtimeHost: z.string().check(z.regex(REALTIME_HOST_PATTERN)),
    httpHost: z.string().check(z.regex(EVENTS_HTTP_HOST_PATTERN)),
  });

  const WebSettingsSchema = object({
    refreshLeadMs: inRange(SETTING_BOUNDS.refreshLeadMs),
    refreshMinIntervalMs: inRange(SETTING_BOUNDS.refreshMinIntervalMs),
    usernameMinLength: inRange(SETTING_BOUNDS.usernameMinLength),
    usernameMaxLength: inRange(SETTING_BOUNDS.usernameMaxLength),
  });

  const WebConfigurationSchema = object({
    featureFlags: z.pipe(
      z.transform(withoutUnknownKeys(WEB_FEATURE_FLAGS)),
      z.record(z.enum(WEB_FEATURE_FLAGS), z.boolean()),
    ),
    mutations: MutationEntriesSchema,
    queries: QueryEntriesSchema,
    services: object({ api: ApiServiceSchema, realtime: z.optional(RealtimeServiceSchema) }),
    settings: WebSettingsSchema,
    version: z.literal(WEB_CONFIGURATION_VERSION),
  });

  return {
    MutationEntrySchema,
    MutationEntriesSchema,
    QueryEntrySchema,
    QueryEntriesSchema,
    ApiServiceSchema,
    RealtimeServiceSchema,
    WebSettingsSchema,
    WebConfigurationSchema,
  };
};
