import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { getMe } from '../../services/api/getMe';
import { refreshSession } from '../../services/session/refreshSession';
import { clearSession } from '../../services/session/clearSession';
import { useMeQuery } from './index';

vi.mock('../../services/api/getMe', () => ({ getMe: vi.fn() }));
vi.mock('../../services/session/refreshSession', () => ({ refreshSession: vi.fn() }));

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
};

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      {children}
    </RemoteConfigContext.Provider>
  </QueryClientProvider>
);

describe('useMeQuery', () => {
  it('loads /me through getMe', async () => {
    vi.mocked(getMe).mockResolvedValue(ME);
    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(ME));
    expect(getMe).toHaveBeenCalledWith('/api/v1/me', expect.any(Function));
  });

  it('refreshes the session through the configured refresh path', async () => {
    vi.mocked(getMe).mockImplementation(async (_path, refresh) => {
      await refresh();
      return ME;
    });
    vi.mocked(refreshSession).mockResolvedValue(true);
    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(ME));
    expect(refreshSession).toHaveBeenCalledWith(
      expect.objectContaining({ refreshPath: '/api/v1/auth/refresh' }),
    );
  });

  it('does not request /me once signed out', async () => {
    clearSession();
    renderHook(() => useMeQuery(), { wrapper });

    await Promise.resolve();

    expect(getMe).not.toHaveBeenCalled();
  });

  it('caches under the me query name', async () => {
    vi.mocked(getMe).mockResolvedValue(ME);
    const { result } = renderHook(() => useMeQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(ME));
    expect(client.getQueryData(['me'])).toEqual(ME);
  });
});
