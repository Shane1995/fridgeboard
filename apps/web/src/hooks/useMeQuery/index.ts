import type { IMeResponse } from '@fridgeboard/contract/me';
import { getMe } from '../../services/api/getMe';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { ME_QUERY_KEY } from './constants';

export const useMeQuery = (): QueryResult<IMeResponse> =>
  useQuery({ queryKey: ME_QUERY_KEY, queryFn: getMe });
