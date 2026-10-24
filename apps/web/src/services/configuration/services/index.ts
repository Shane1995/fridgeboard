import * as z from 'zod/mini';
import { PARAM_VALUE_PATTERN } from '../base/constants';
import { RequestTimeoutSchema } from '../requestTimeout';
import {
  API_URL_PATTERN,
  SAFE_URL_PATTERN,
  SAME_ORIGIN_PATH_PATTERN,
} from '../webConfigurationSchema/constants';
import { ENDPOINT_PATH_PATTERN } from './constants';
import { WEB_SERVICES } from './constants';

const basePath = z
  .string()
  .check(z.regex(SAME_ORIGIN_PATH_PATTERN), z.regex(API_URL_PATTERN), z.regex(SAFE_URL_PATTERN));

const endpointPath = z.string().check(z.regex(ENDPOINT_PATH_PATTERN), z.regex(SAFE_URL_PATTERN));

const EndpointConfigSchema = z.strictObject({ timeoutMs: z.optional(RequestTimeoutSchema) });

export const ApiServiceSchema = z.strictObject({
  basePath,
  endpoints: z.record(z.enum(WEB_SERVICES), endpointPath),
  endpointsConfig: z.optional(z.partialRecord(z.enum(WEB_SERVICES), EndpointConfigSchema)),
  params: z.strictObject({ version: z.string().check(z.regex(PARAM_VALUE_PATTERN)) }),
});
