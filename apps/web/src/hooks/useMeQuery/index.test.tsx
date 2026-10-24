import type { IMeResponse } from '@fridgeboard/contract/me';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { SessionContext } from '../../Context/Session';
import { createSession } from '../../testUtils/createSession';
import { SessionStatus } from '../../services/session/constants';
import { useMeQuery } from './index';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { endpoint } from '../../testUtils/endpoint';

const ME: IMeResponse = {
  sub: 'sub-1',
  email: 'jess@example.com',
  username: null,
  isAdmin: false,
  canCreateHousehold: true,
};

const apiFetch = vi.fn();

const renderMe = (status: SessionStatus, client = new QueryClient()) => {
  const session = { ...createSession(status).session, apiFetch };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RemoteConfigContext.Provider value={TEST_WEB_CONFIGURATION}>
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
    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/me'));
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
