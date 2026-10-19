import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { getMe } from '../../services/api/getMe';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import { SessionStatus } from '../../services/session/constants';
import { getSessionStatus } from '../../services/session/getSessionStatus';
import { refreshSession } from '../../services/session/refreshSession';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { useRemoteConfig } from '../useRemoteConfig';
import { useSessionConfig } from '../useSessionConfig';
import { ME_QUERY_KEY } from './constants';

export const useMeQuery = (): QueryResult<IMeResponse> => {
  const { services } = useRemoteConfig();
  const sessionConfig = useSessionConfig();
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () =>
      getMe(resolveServicePath(services, WebService.me), () => refreshSession(sessionConfig)),
    enabled: getSessionStatus() !== SessionStatus.SignedOut,
  });
};
