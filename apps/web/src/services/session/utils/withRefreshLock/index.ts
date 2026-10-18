import { REFRESH_LOCK_NAME } from '../../constants';

export const withRefreshLock = (run: () => Promise<boolean>): Promise<boolean> => {
  const locks: LockManager | undefined = navigator.locks;
  return locks ? locks.request(REFRESH_LOCK_NAME, run) : run();
};
