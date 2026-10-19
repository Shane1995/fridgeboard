import { createRouter, type RouterHistory } from '@tanstack/react-router';
import { AppLoader } from '../../../../components/AppLoader';
import { ROUTER_PENDING_MIN_MS, ROUTER_PENDING_MS } from '../../constants';
import { routeTree } from '../../routeTree.gen';

export const createAppRouter = (history?: RouterHistory) => {
  return createRouter({
    routeTree,
    ...(history && { history }),
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: AppLoader,
    defaultPendingMs: ROUTER_PENDING_MS,
    defaultPendingMinMs: ROUTER_PENDING_MIN_MS,
    scrollRestoration: true,
  });
};
