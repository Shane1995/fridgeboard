import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { updateSession } from '../../services/session/updateSession';
import { useResetCacheOnSignOut } from './index';

const setup = () => {
  const client = new QueryClient();
  client.setQueryData(['me'], { email: 'jess@example.com' });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const view = renderHook(() => useResetCacheOnSignOut(), { wrapper });
  return { client, ...view };
};

describe('useResetCacheOnSignOut', () => {
  it('clears the query cache when the session signs out', () => {
    const { client } = setup();

    updateSession({ status: SessionStatus.SignedOut });

    expect(client.getQueryData(['me'])).toBeUndefined();
  });

  it('keeps the cache for other status changes and after unmount', () => {
    const { client, unmount } = setup();

    updateSession({ status: SessionStatus.SignedIn });
    expect(client.getQueryData(['me'])).toBeDefined();

    unmount();
    updateSession({ status: SessionStatus.SignedOut });
    expect(client.getQueryData(['me'])).toBeDefined();
  });
});
