import { getJson } from '../../services/api/getJson';
import { resolveEndpoint } from '../../services/configuration/resolveEndpoint';
import { mergedEntry } from '../../utils/mergedEntry';
import { SessionStatus } from '../../services/session/constants';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import type { ApiQueryOptions } from './types';

// A signed-in GET of one API service. Add a query by calling this with its name and service.
export const useApiQuery = <TData>({
  name,
  service,
  params,
  enabled = true,
}: ApiQueryOptions): QueryResult<TData> => {
  const { services, queries } = useRemoteConfigContext();
  const { status, apiFetch } = useSessionContext();
  return useQuery({
    queryKey: params === undefined ? [name] : [name, params],
    queryFn: () =>
      getJson<TData>(
        resolveEndpoint({
          api: services.api,
          service,
          timeoutMs: mergedEntry(queries, name).timeoutMs,
          ...(params === undefined ? {} : { params }),
        }),
        (endpoint) => apiFetch(endpoint),
      ),
    enabled: enabled && status === SessionStatus.SignedIn,
  });
};
