import * as z from 'zod/mini';
import { CONFIGURATION_VERSION } from './constants.ts';

const ServiceParamsSchema = z.record(z.string(), z.string());

export const baseConfigurationShape = {
  version: z.literal(CONFIGURATION_VERSION),
};

export const serviceSchemaFor = (urlSchema: z.ZodMiniString) =>
  z.strictObject({ url: urlSchema, params: z.optional(ServiceParamsSchema) });
