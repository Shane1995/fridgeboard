import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { createRouter, type RouterHistory } from '@tanstack/react-router';
import { AppLoader } from '../../../../components/AppLoader';
import { ROUTER_PENDING_MIN_MS, ROUTER_PENDING_MS } from '../../constants';
import { routeTree } from '../../routeTree.gen';
import { buildRouterContext } from '../buildRouterContext';

export const createAppRouter = (history?: RouterHistory) => {
  return createRouter({
    routeTree,
    ...(history && { history }),
    context: buildRouterContext(DEFAULT_WEB_CONFIGURATION),
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: AppLoader,
    defaultPendingMs: ROUTER_PENDING_MS,
    defaultPendingMinMs: ROUTER_PENDING_MIN_MS,
    scrollRestoration: true,
  });
};
