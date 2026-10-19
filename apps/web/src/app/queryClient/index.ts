import { QueryClient } from '@tanstack/query-core';
import { BASE_DEFAULT_OPTIONS } from './constants';

export const queryClient = new QueryClient({ defaultOptions: BASE_DEFAULT_OPTIONS });
