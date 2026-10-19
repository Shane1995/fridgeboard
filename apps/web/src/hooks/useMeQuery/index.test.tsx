import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';
import { useMeQuery } from './index';

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
  households: [],
  onboarding: [
    { id: 'username', done: false },
    { id: 'household', done: false },
  ],
};

const apiFetch = vi.fn();

const renderMe = (status: SessionStatus, client = new QueryClient()) => {
  const session: SessionContextValue = {
    status,
    startSignIn: vi.fn(),
    verifyCode: vi.fn(),
    signOut: vi.fn(),
    refresh: vi.fn(),
    apiFetch,
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
        <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
      </RemoteConfigContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(() => useMeQuery(), { wrapper });
};

describe('useMeQuery', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new Response(JSON.stringify(ME), { status: 200 }));
  });

  it('loads /me through the session apiFetch', async () => {
    const { result } = renderMe(SessionStatus.SignedIn);

    await waitFor(() => expect(result.current.data).toEqual(ME));
    expect(apiFetch).toHaveBeenCalledWith('/api/v1/me');
  });

  it.each([SessionStatus.Loading, SessionStatus.SignedOut])(
    'does not request /me while %s',
    async (status) => {
      renderMe(status);

      await Promise.resolve();

      expect(apiFetch).not.toHaveBeenCalled();
    },
  );

  it('caches under the me query name', async () => {
    const client = new QueryClient();
    const { result } = renderMe(SessionStatus.SignedIn, client);

    await waitFor(() => expect(result.current.data).toEqual(ME));
    expect(client.getQueryData(['me'])).toEqual(ME);
  });
});
