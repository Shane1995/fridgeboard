import { resolveServiceUrl } from '../resolveServiceUrl';
import type { WebService } from '../services/constants';
import type { ApiService } from '../services/types';

export const resolveEndpointUrl = (api: ApiService, endpoint: WebService): string =>
  resolveServiceUrl({ url: `${api.basePath}${api.endpoints[endpoint]}`, params: api.params });
