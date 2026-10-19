import type { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useConfigurationQuery } from '../useConfigurationQuery';
import { applyQuerySettings } from './utils/applyQuerySettings';

export const useApplyQuerySettings = (queryClient: QueryClient): void => {
  const { data } = useConfigurationQuery();

  useEffect(() => {
    if (data) {
      applyQuerySettings(queryClient, data);
    }
  }, [queryClient, data]);
};
