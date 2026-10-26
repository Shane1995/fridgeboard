import type * as z from 'zod/mini';
import type {
  ApiServiceSchema,
  MutationEntriesSchema,
  MutationEntrySchema,
  QueryEntriesSchema,
  QueryEntrySchema,
  RealtimeServiceSchema,
  WebSettingsSchema,
} from '.';

export type MutationEntry = z.infer<typeof MutationEntrySchema>;

export type MutationEntries = z.infer<typeof MutationEntriesSchema>;

export type QueryEntry = z.infer<typeof QueryEntrySchema>;

export type QueryEntries = z.infer<typeof QueryEntriesSchema>;

export type ApiService = z.infer<typeof ApiServiceSchema>;

export type RealtimeService = z.infer<typeof RealtimeServiceSchema>;

export type WebSettings = z.infer<typeof WebSettingsSchema>;
