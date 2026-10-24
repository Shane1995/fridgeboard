import { useEffect } from 'react';
import { recoverFromStaleBuild } from '../../services/appUpdates/recoverFromStaleBuild';

export const useStaleBuildRecovery = (): void => {
  useEffect(() => {
    void recoverFromStaleBuild();
  }, []);
};
