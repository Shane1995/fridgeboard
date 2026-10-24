import * as z from 'zod/mini';
import { CONFIGURATION_VERSION, PARAM_NAME_PATTERN, PARAM_VALUE_PATTERN } from './constants.ts';

const ServiceParamsSchema = z.record(
  z.string().check(z.regex(PARAM_NAME_PATTERN)),
  z.string().check(z.regex(PARAM_VALUE_PATTERN)),
);

export const baseConfigurationShape = {
  version: z.literal(CONFIGURATION_VERSION),
};

export const serviceSchemaFor = (urlSchema: z.ZodMiniString) =>
  z.strictObject({ url: urlSchema, params: z.optional(ServiceParamsSchema) });
