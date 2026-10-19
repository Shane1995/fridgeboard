import { useMemo } from 'react';
import { toSessionConfig } from '../../services/session/utils/toSessionConfig';
import type { SessionConfig } from '../../services/session/types';
import { useRemoteConfig } from '../useRemoteConfig';

export const useSessionConfig = (): SessionConfig => {
  const configuration = useRemoteConfig();
  return useMemo(() => toSessionConfig(configuration), [configuration]);
};
