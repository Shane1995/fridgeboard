import type { WebConfiguration } from '../useRemoteConfigContext/types';
import { useQuery as useTanStackQuery } from '@tanstack/react-query';
import { getConfiguration } from '../../services/configuration';
import type { QueryResult } from '../useQuery/types';
import {
  CONFIGURATION_QUERY_KEY,
  CONFIGURATION_RETRY_COUNT,
  CONFIGURATION_STALE_TIME_MS,
} from './constants';

export const useConfigurationQuery = (): QueryResult<WebConfiguration> =>
  useTanStackQuery({
    queryKey: CONFIGURATION_QUERY_KEY,
    queryFn: getConfiguration,
    staleTime: CONFIGURATION_STALE_TIME_MS,
    retry: CONFIGURATION_RETRY_COUNT,
  });
