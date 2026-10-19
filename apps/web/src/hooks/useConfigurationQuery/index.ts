import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { getConfiguration } from '../../services/configuration';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { CONFIGURATION_QUERY_KEY, CONFIGURATION_STALE_TIME_MS } from './constants';

export const useConfigurationQuery = (): QueryResult<WebConfiguration> =>
  useQuery({
    queryKey: CONFIGURATION_QUERY_KEY,
    queryFn: getConfiguration,
    staleTime: CONFIGURATION_STALE_TIME_MS,
  });
