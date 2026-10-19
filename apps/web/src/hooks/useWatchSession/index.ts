import { useEffect } from 'react';
import { watchSession } from '../../services/session/watchSession';
import { useSessionConfig } from '../useSessionConfig';

export const useWatchSession = (): void => {
  const config = useSessionConfig();

  useEffect(() => watchSession(config), [config]);
};
