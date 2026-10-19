import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { getMe } from '../../services/api/getMe';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import { SessionStatus } from '../../services/session/constants';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import { ME_QUERY_KEY } from './constants';

export const useMeQuery = (): QueryResult<IMeResponse> => {
  const { services } = useRemoteConfigContext();
  const { status, apiFetch } = useSessionContext();
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => getMe(resolveServicePath(services, WebService.me), (path) => apiFetch(path)),
    enabled: status === SessionStatus.SignedIn,
  });
};
