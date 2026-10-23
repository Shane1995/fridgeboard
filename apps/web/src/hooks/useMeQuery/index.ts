import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { getMe } from '../../services/api/getMe';
import { resolveQueryEndpoint } from '../../services/configuration/resolveEndpoint';
import { SessionStatus } from '../../services/session/constants';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import { ME_QUERY_KEY } from './constants';

export const useMeQuery = (): QueryResult<IMeResponse> => {
  const configuration = useRemoteConfigContext();
  const { status, apiFetch } = useSessionContext();
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () =>
      getMe(
        resolveQueryEndpoint(configuration, WebService.me, configuration.queries.me),
        (endpoint) => apiFetch(endpoint),
      ),
    enabled: status === SessionStatus.SignedIn,
  });
};
