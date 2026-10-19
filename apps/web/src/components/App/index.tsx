import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '../../services/queryClient';
import { router } from '../../app/router';
import { useResetCacheOnSignOut } from '../../hooks/useResetCacheOnSignOut';

export const App = () => {
  useResetCacheOnSignOut(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
