import type { WebService } from '../schema/constants';
import type { ApiService } from '../schema/types';

export type ResolveEndpointOptions = {
  api: ApiService;
  service: WebService;
  timeoutMs: number;
  params?: Record<string, string>;
};
