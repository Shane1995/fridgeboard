import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '../../services/queryClient';
import { router } from '../../app/router';
import { RemoteConfigProvider } from '../../Context/RemoteConfig';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RemoteConfigProvider>
        <RouterProvider router={router} />
      </RemoteConfigProvider>
    </QueryClientProvider>
  );
};
