import type { IMeResponse } from '@fridgeboard/contract/me';
import { WebService } from '../../services/configuration/services/constants';
import { useApiQuery } from '../useApiQuery';
import type { QueryResult } from '../useQuery/types';
import { ME_QUERY_KEY } from './constants';

export const useMeQuery = (): QueryResult<IMeResponse> =>
  useApiQuery({ name: ME_QUERY_KEY, service: WebService.me });
