import { resolveServiceUrl } from '../resolveServiceUrl/index.ts';
import type { WebService } from '../services/constants.ts';
import type { ApiService } from '../services/types.ts';

export const resolveEndpointUrl = (api: ApiService, endpoint: WebService): string =>
  resolveServiceUrl({ url: `${api.basePath}${api.endpoints[endpoint]}`, params: api.params });
