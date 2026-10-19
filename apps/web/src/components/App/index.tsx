import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '../../services/queryClient';
import { router } from '../../app/router';
import { SignOutCacheReset } from '../SignOutCacheReset';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SignOutCacheReset />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
