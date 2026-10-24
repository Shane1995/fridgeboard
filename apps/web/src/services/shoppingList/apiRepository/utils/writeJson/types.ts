import type { Endpoint } from '../../../../configuration/types';

export type WriteJsonOptions = {
  endpoint: Endpoint;
  method: string;
  body?: unknown;
  fetcher: (endpoint: Endpoint, init: RequestInit) => Promise<Response>;
};
