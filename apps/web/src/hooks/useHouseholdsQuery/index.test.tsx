import type { IHouseholdsResponse } from '@fridgeboard/contract/households';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { SessionContext } from '../../Context/Session';
import { createSession } from '../../testUtils/createSession';
import { SessionStatus } from '../../services/session/constants';
import { useHouseholdsQuery } from './index';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { endpoint } from '../../testUtils/endpoint';

const HOUSEHOLDS: IHouseholdsResponse = {
  households: [{ id: 'h1', name: 'Home', role: 'owner' }],
};

const apiFetch = vi.fn();

const renderHouseholds = (status: SessionStatus, client = new QueryClient()) => {
  const session = { ...createSession(status).session, apiFetch };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RemoteConfigContext.Provider value={TEST_WEB_CONFIGURATION}>
        <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
      </RemoteConfigContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(() => useHouseholdsQuery(), { wrapper });
};

describe('useHouseholdsQuery', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new Response(JSON.stringify(HOUSEHOLDS), { status: 200 }));
  });

  it('loads the households through the session apiFetch', async () => {
    const { result } = renderHouseholds(SessionStatus.SignedIn);

    await waitFor(() => expect(result.current.data).toEqual(HOUSEHOLDS));
    expect(apiFetch).toHaveBeenCalledWith(endpoint('/api/v1/households'));
  });

  it('does not request households while signed out', async () => {
    renderHouseholds(SessionStatus.SignedOut);

    await Promise.resolve();

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('caches under the households query name', async () => {
    const client = new QueryClient();
    const { result } = renderHouseholds(SessionStatus.SignedIn, client);

    await waitFor(() => expect(result.current.data).toEqual(HOUSEHOLDS));
    expect(client.getQueryData(['households'])).toEqual(HOUSEHOLDS);
  });
});
