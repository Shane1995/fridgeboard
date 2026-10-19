import type { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BASE_DEFAULT_OPTIONS } from '../../app/queryClient/constants';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { applyQuerySettings } from './utils/applyQuerySettings';

export const useApplyQuerySettings = (queryClient: QueryClient): void => {
  const configuration = useRemoteConfigContext();

  useEffect(() => {
    applyQuerySettings(queryClient, configuration, BASE_DEFAULT_OPTIONS);
  }, [queryClient, configuration]);
};
