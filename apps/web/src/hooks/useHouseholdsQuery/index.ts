import type { IHouseholdsResponse } from '@fridgeboard/contract/households';
import { WebService } from '../../services/configuration/schema/constants';
import { useApiQuery } from '../useApiQuery';
import type { QueryResult } from '../useQuery/types';
import { HOUSEHOLDS_QUERY_KEY } from './constants';

export const useHouseholdsQuery = (): QueryResult<IHouseholdsResponse> =>
  useApiQuery({ name: HOUSEHOLDS_QUERY_KEY, service: WebService.households });
