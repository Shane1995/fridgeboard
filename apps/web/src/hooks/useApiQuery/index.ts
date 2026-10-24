import { getJson } from '../../services/api/getJson';
import { resolveQueryEndpoint } from '../../services/configuration/resolveEndpoint';
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
  enabled = true,
}: ApiQueryOptions): QueryResult<TData> => {
  const configuration = useRemoteConfigContext();
  const { status, apiFetch } = useSessionContext();
  return useQuery({
    queryKey: [name],
    queryFn: () =>
      getJson<TData>(resolveQueryEndpoint(configuration, service, name), (endpoint) =>
        apiFetch(endpoint),
      ),
    enabled: enabled && status === SessionStatus.SignedIn,
  });
};
