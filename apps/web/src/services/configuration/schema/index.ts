import { createWebConfigurationSchemas } from './createWebConfigurationSchemas';

export const {
  MutationEntrySchema,
  MutationEntriesSchema,
  QueryEntrySchema,
  QueryEntriesSchema,
  ApiServiceSchema,
  WebSettingsSchema,
  WebConfigurationSchema,
} = createWebConfigurationSchemas({ strict: true });

export const LenientWebConfigurationSchema = createWebConfigurationSchemas({
  strict: false,
}).WebConfigurationSchema;
