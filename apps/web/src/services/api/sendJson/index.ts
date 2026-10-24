import type { Endpoint } from '../../configuration/types';
import type { ApiResult } from './types';

// Sends a JSON body. A failure answers `{ reason }`; any reason not in `reasons` (or an unreadable
// body) becomes 'unknown'.
export const sendJson = async <TData, TReason extends string>(
  endpoint: Endpoint,
  method: string,
  body: unknown,
  reasons: readonly TReason[],
  fetcher: (endpoint: Endpoint, init: RequestInit) => Promise<Response>,
): Promise<ApiResult<TData, TReason>> => {
  const response = await fetcher(endpoint, { method, body: JSON.stringify(body) });
  if (response.ok) {
    return { ok: true, data: await response.json() };
  }
  const failure: { reason?: unknown } = await response.json().catch(() => ({}));
  const reason = reasons.find((known) => known === failure.reason);
  return { ok: false, reason: reason ?? 'unknown' };
};
