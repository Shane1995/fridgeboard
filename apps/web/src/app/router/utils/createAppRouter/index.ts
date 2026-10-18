import { createRouter, type RouterHistory } from '@tanstack/react-router';
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
    scrollRestoration: true,
  });
};
