import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { useInvalidateQueries } from './index';

describe('useInvalidateQueries', () => {
  it('invalidates every query under each named key', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const { session } = createSession(SessionStatus.SignedIn);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders session={session} client={client}>
        {children}
      </TestProviders>
    );
    const { result } = renderHook(() => useInvalidateQueries(), { wrapper });

    await result.current({ keys: ['items', 'suggestions'] });

    expect(spy.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['items'],
      ['suggestions'],
    ]);
  });

  it('can mark queries stale without fetching them again', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const { session } = createSession(SessionStatus.SignedIn);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders session={session} client={client}>
        {children}
      </TestProviders>
    );
    const { result } = renderHook(() => useInvalidateQueries(), { wrapper });

    await result.current({ keys: ['suggestions'], refetchType: 'none' });

    expect(spy).toHaveBeenCalledWith({ queryKey: ['suggestions'], refetchType: 'none' });
  });
});
