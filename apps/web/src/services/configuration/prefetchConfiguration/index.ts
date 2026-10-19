import { queryClient } from '../../queryClient';
import { getConfiguration } from '..';
import { CONFIGURATION_QUERY_KEY, CONFIGURATION_STALE_TIME_MS } from '../constants';

export const prefetchConfiguration = (): void => {
  void queryClient
    .query({
      queryKey: CONFIGURATION_QUERY_KEY,
      queryFn: getConfiguration,
      staleTime: CONFIGURATION_STALE_TIME_MS,
    })
    .catch(() => undefined);
};
