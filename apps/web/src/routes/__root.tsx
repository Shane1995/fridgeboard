import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { RouteFallback } from '../components/RouteFallback';
import { ROUTER_COPY } from '../services/router/constants';
import type { RouterContext } from '../services/router/types';

const Devtools = import.meta.env.DEV
  ? lazy(() => import('../components/Devtools').then((m) => ({ default: m.Devtools })))
  : null;

const NotFound = () => {
  return <RouteFallback title={ROUTER_COPY.notFound} />;
};

const RouteError = () => {
  return <RouteFallback title={ROUTER_COPY.error} />;
};

const Root = () => {
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

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});
