import { RouterProvider } from '@tanstack/react-router';
import { router } from '../../../../app/router';
import { useApplyQuerySettings } from '../../../../hooks/useApplyQuerySettings';
import { useResetCacheOnSignOut } from '../../../../hooks/useResetCacheOnSignOut';
import { queryClient } from '../../../../services/queryClient';

export const AppShell = () => {
  useResetCacheOnSignOut(queryClient);
  useApplyQuerySettings(queryClient);

  return <RouterProvider router={router} />;
};
