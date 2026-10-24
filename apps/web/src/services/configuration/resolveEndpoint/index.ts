import type { WebConfiguration } from '../../../hooks/useRemoteConfigContext/types';
import { mergedEntry } from '../../../utils/mergedEntry';
import { resolveEndpointUrl } from '../resolveEndpointUrl';
import type { WebService } from '../services/constants';
import type { Endpoint } from '../types';

const resolve = (
  { api }: WebConfiguration['services'],
  endpoint: WebService,
  timeoutMs: number,
): Endpoint => ({
  path: resolveEndpointUrl(api, endpoint),
  timeoutMs: api.endpointsConfig?.[endpoint]?.timeoutMs ?? timeoutMs,
});

// `name` picks the named query entry whose timeout applies; without one the default entry does.
export const resolveQueryEndpoint = (
  { services, queries }: Pick<WebConfiguration, 'services' | 'queries'>,
  endpoint: WebService,
  name?: string,
): Endpoint => resolve(services, endpoint, mergedEntry(queries, name).timeoutMs);

export const resolveMutationEndpoint = (
  { services, mutations }: Pick<WebConfiguration, 'services' | 'mutations'>,
  endpoint: WebService,
  name?: string,
): Endpoint => resolve(services, endpoint, mergedEntry(mutations, name).timeoutMs);
