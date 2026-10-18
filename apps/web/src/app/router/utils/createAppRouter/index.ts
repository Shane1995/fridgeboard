import { createRouter, type RouterHistory } from '@tanstack/react-router';
import { routeTree } from '../../routeTree.gen';
import { queryClient } from '../../../../services/queryClient';

export const createAppRouter = (history?: RouterHistory) => {
  return createRouter({
    routeTree,
    ...(history && { history }),
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
};
