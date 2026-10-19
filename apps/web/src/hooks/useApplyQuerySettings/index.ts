import type { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRemoteConfig } from '../../Context/RemoteConfig';
import { applyQuerySettings } from './utils/applyQuerySettings';

export const useApplyQuerySettings = (queryClient: QueryClient): void => {
  const configuration = useRemoteConfig();

  useEffect(() => {
    applyQuerySettings(queryClient, configuration);
  }, [queryClient, configuration]);
};
