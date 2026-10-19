import { createRouter, type RouterHistory } from '@tanstack/react-router';
import { AppLoader } from '../../../../components/AppLoader';
import { ROUTER_PENDING_MIN_MS, ROUTER_PENDING_MS } from '../../constants';
import { routeTree } from '../../routeTree.gen';
import { queryClient } from '../../../../services/queryClient';
import { getSessionStatus } from '../../../../services/session/getSessionStatus';
import { refreshSession } from '../../../../services/session/refreshSession';

export const createAppRouter = (history?: RouterHistory) => {
  return createRouter({
    routeTree,
    ...(history && { history }),
    context: { queryClient, session: { getStatus: getSessionStatus, refresh: refreshSession } },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: AppLoader,
    defaultPendingMs: ROUTER_PENDING_MS,
    defaultPendingMinMs: ROUTER_PENDING_MIN_MS,
    scrollRestoration: true,
  });
};
