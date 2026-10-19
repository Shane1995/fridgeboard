import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../app/queryClient';
import { RemoteConfigProvider } from '../../Context/RemoteConfig';
import { AppRouter } from '../AppRouter';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RemoteConfigProvider>
        <AppRouter />
      </RemoteConfigProvider>
    </QueryClientProvider>
  );
};
