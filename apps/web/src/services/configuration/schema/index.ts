import * as z from 'zod/mini';
import {
  API_URL_PATTERN,
  ENDPOINT_PATH_PATTERN,
  MUTATION_BOUNDS,
  QUERY_BOUNDS,
  REQUEST_TIMEOUT_BOUNDS,
  SAFE_URL_PATTERN,
  SETTING_BOUNDS,
  WEB_CONFIGURATION_VERSION,
  WEB_FEATURE_FLAGS,
  WEB_SERVICES,
} from './constants';

const inRange = ({ min, max }: { min: number; max: number }) =>
  z.int().check(z.gte(min), z.lte(max));

const RequestTimeoutSchema = inRange(REQUEST_TIMEOUT_BOUNDS);

const MutationDefaultSchema = z.strictObject({
  retry: inRange(MUTATION_BOUNDS.retry),
  timeoutMs: RequestTimeoutSchema,
});

export const MutationEntrySchema = z.partial(MutationDefaultSchema);

export const MutationEntriesSchema = z.strictObject({
  default: MutationDefaultSchema,
  signOut: z.optional(MutationEntrySchema),
});

const QueryDefaultSchema = z.strictObject({
  gcTimeMs: inRange(QUERY_BOUNDS.timeMs),
  refetchOnWindowFocus: z.boolean(),
  retry: inRange(QUERY_BOUNDS.retry),
  staleTimeMs: inRange(QUERY_BOUNDS.timeMs),
  timeoutMs: RequestTimeoutSchema,
});

export const QueryEntrySchema = z.partial(QueryDefaultSchema);

export const QueryEntriesSchema = z
  .strictObject({
    default: QueryDefaultSchema,
    me: z.optional(QueryEntrySchema),
    onboarding: z.optional(QueryEntrySchema),
    households: z.optional(QueryEntrySchema),
  })
  .check(
    z.refine(
      (entries) => (entries.me?.staleTimeMs ?? 0) <= QUERY_BOUNDS.meStaleTimeMs.max,
      'me staleTimeMs exceeds the allowed maximum',
    ),
  );

const endpointPath = z
  .string()
  .check(z.regex(API_URL_PATTERN), z.regex(ENDPOINT_PATH_PATTERN), z.regex(SAFE_URL_PATTERN));

const EndpointConfigSchema = z.strictObject({ timeoutMs: z.optional(RequestTimeoutSchema) });

export const ApiServiceSchema = z.strictObject({
  endpoints: z.record(z.enum(WEB_SERVICES), endpointPath),
  endpointsConfig: z.optional(z.partialRecord(z.enum(WEB_SERVICES), EndpointConfigSchema)),
});

export const WebSettingsSchema = z.strictObject({
  refreshLeadMs: inRange(SETTING_BOUNDS.refreshLeadMs),
  refreshMinIntervalMs: inRange(SETTING_BOUNDS.refreshMinIntervalMs),
  usernameMinLength: inRange(SETTING_BOUNDS.usernameMinLength),
  usernameMaxLength: inRange(SETTING_BOUNDS.usernameMaxLength),
});

export const WebConfigurationSchema = z.strictObject({
  featureFlags: z.record(z.enum(WEB_FEATURE_FLAGS), z.boolean()),
  mutations: MutationEntriesSchema,
  queries: QueryEntriesSchema,
  services: z.strictObject({ api: ApiServiceSchema }),
  settings: WebSettingsSchema,
  version: z.literal(WEB_CONFIGURATION_VERSION),
});
