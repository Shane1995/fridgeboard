import { createRootRoute } from '@tanstack/react-router';
import { RootLayout } from '../components/RootLayout';
import { NotFound } from '../pages/NotFound';
import { RouteError } from '../pages/RouteError';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});
