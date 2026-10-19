import { useMemo } from 'react';
import { buildRouterContext } from '../../app/router/utils/buildRouterContext';
import type { RouterContext } from '../../app/router/types';
import { useRemoteConfig } from '../useRemoteConfig';

export const useRouterContext = (): RouterContext => {
  const configuration = useRemoteConfig();
  return useMemo(() => buildRouterContext(configuration), [configuration]);
};
