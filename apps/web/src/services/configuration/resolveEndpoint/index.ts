import type { ApiService } from '../schema/types';
import type { WebService } from '../schema/constants';
import type { Endpoint } from '../types';

// The path is read straight from the configuration. A per-endpoint timeout wins over the
// timeout of the query or mutation that calls it.
export const resolveEndpoint = (
  { endpoints, endpointsConfig }: ApiService,
  service: WebService,
  timeoutMs: number,
): Endpoint => ({
  path: endpoints[service],
  timeoutMs: endpointsConfig?.[service]?.timeoutMs ?? timeoutMs,
});
