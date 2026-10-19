import { useResetCacheOnSignOut } from '../../hooks/useResetCacheOnSignOut';

export const SignOutCacheReset = () => {
  useResetCacheOnSignOut();
  return null;
};
