import type * as z from 'zod/mini';
import type { ApiServiceSchema } from '.';

export type ApiService = z.infer<typeof ApiServiceSchema>;
