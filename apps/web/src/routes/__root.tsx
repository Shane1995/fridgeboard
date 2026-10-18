import { createRootRouteWithContext } from '@tanstack/react-router';
import type { RouterContext } from '../app/router/types';
import { RootLayout } from '../components/RootLayout';
import { NotFound } from '../pages/NotFound';
import { RouteError } from '../pages/RouteError';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});
