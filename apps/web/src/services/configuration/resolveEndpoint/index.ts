import { resolveEndpointUrl } from '@fridgeboard/contract/configuration/resolveEndpointUrl';
import type { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import type { Endpoint } from '../types';

type Named = { timeoutMs?: number | undefined };

const resolve = (
  { api }: WebConfiguration['services'],
  endpoint: WebService,
  timeoutMs: number,
): Endpoint => ({
  path: resolveEndpointUrl(api, endpoint),
  timeoutMs: api.endpointsConfig?.[endpoint]?.timeoutMs ?? timeoutMs,
});

export const resolveQueryEndpoint = (
  { services, queries }: Pick<WebConfiguration, 'services' | 'queries'>,
  endpoint: WebService,
  named: Named = {},
): Endpoint => resolve(services, endpoint, named.timeoutMs ?? queries.default.timeoutMs);

export const resolveMutationEndpoint = (
  { services, mutations }: Pick<WebConfiguration, 'services' | 'mutations'>,
  endpoint: WebService,
  named: Named = {},
): Endpoint => resolve(services, endpoint, named.timeoutMs ?? mutations.default.timeoutMs);
