import { Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useRecoverOnResume } from '../../hooks/useRecoverOnResume';

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../../app/devtools').then((m) => ({ default: m.Devtools })))
  : null;

export const RootLayout = () => {
  useRecoverOnResume();
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
