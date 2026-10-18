import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { ROUTER_COPY } from '../services/router/constants';
import type { RouterContext } from '../services/router/types';

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../components/Devtools').then((m) => ({ default: m.Devtools })))
  : null;

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl">{ROUTER_COPY.notFound}</h1>
      <Link to="/">{ROUTER_COPY.home}</Link>
    </main>
  );
}

function RouteError() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl">{ROUTER_COPY.error}</h1>
      <Link to="/">{ROUTER_COPY.home}</Link>
    </main>
  );
}

function Root() {
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
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});
