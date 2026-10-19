import { Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useApplyQuerySettings } from '../../hooks/useApplyQuerySettings';
import { useWatchSession } from '../../hooks/useWatchSession';
import { useResetCacheOnSignOut } from '../../hooks/useResetCacheOnSignOut';
import { queryClient } from '../../app/queryClient';

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../../app/devtools').then((m) => ({ default: m.Devtools })))
  : null;

export const RootLayout = () => {
  useResetCacheOnSignOut(queryClient);
  useApplyQuerySettings(queryClient);
  useWatchSession();

  return (
    <>
      <Outlet />
      {Devtools && (
        <Suspense>
          <Devtools />
        </Suspense>
      )}
    </>
  );
};
