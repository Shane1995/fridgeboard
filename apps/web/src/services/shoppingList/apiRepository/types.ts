import type { Endpoint } from '../../configuration/types';
import type { ApiService } from '../../configuration/schema/types';

export type ApiRepositoryOptions = {
  householdId: string;
  listId: string;
  api: ApiService;
  readTimeoutMs: number;
  writeTimeoutMs: number;
  fetcher: (endpoint: Endpoint, init?: RequestInit) => Promise<Response>;
};
