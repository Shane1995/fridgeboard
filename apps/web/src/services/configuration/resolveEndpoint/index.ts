import type { Endpoint } from '../types';
import { UNRESOLVED_ENDPOINT_ERROR } from './constants';
import type { ResolveEndpointOptions } from './types';

// The path is read straight from the configuration, with `{name}` placeholders filled from
// `params`. A per-endpoint timeout wins over the timeout of the query or mutation that calls it.
export const resolveEndpoint = ({
  api: { endpoints, endpointsConfig },
  service,
  timeoutMs,
  params = {},
}: ResolveEndpointOptions): Endpoint => {
  const path = Object.entries(params).reduce(
    (current, [name, value]) => current.replaceAll(`{${name}}`, encodeURIComponent(value)),
    endpoints[service],
  );
  if (path.includes('{')) {
    throw new Error(UNRESOLVED_ENDPOINT_ERROR);
  }
  return { path, timeoutMs: endpointsConfig?.[service]?.timeoutMs ?? timeoutMs };
};
