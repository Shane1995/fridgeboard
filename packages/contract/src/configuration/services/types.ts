import type * as z from 'zod/mini';
import type { ApiServiceSchema } from './index.ts';

export type ApiService = z.infer<typeof ApiServiceSchema>;
