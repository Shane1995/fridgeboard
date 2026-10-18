import { Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../../app/devtools').then((m) => ({ default: m.Devtools })))
  : null;

export const RootLayout = () => {
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
