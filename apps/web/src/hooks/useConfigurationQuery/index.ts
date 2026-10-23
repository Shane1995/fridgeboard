import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { useQueryClient } from '@tanstack/react-query';
import { getConfiguration } from '../../services/configuration';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import {
  CONFIGURATION_QUERY_KEY,
  CONFIGURATION_RETRY_COUNT,
  CONFIGURATION_STALE_TIME_MS,
} from './constants';
import { applyQuerySettings } from './utils/applyQuerySettings';

export const useConfigurationQuery = (): QueryResult<WebConfiguration> => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: CONFIGURATION_QUERY_KEY,
    queryFn: async () => {
      const configuration = await getConfiguration();
      applyQuerySettings(queryClient, configuration);
      return configuration;
    },
    staleTime: CONFIGURATION_STALE_TIME_MS,
    retry: CONFIGURATION_RETRY_COUNT,
  });
};
