import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { useFetchChanges } from '.';

const useListParams = vi.hoisted(() => vi.fn());
vi.mock('../useListParams', () => ({ useListParams }));

const render = (retry = 1) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  const config = {
    ...TEST_WEB_CONFIGURATION,
    queries: {
      ...TEST_WEB_CONFIGURATION.queries,
      default: { ...TEST_WEB_CONFIGURATION.queries.default, retry },
    },
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} client={new QueryClient()} config={config}>
      {children}
    </TestProviders>
  );
  return { apiFetch, ...renderHook(() => useFetchChanges(), { wrapper }) };
};

describe('useFetchChanges', () => {
  beforeEach(() => {
    useListParams.mockReset().mockReturnValue({ householdId: 'hh-1' });
  });

  it('asks the changes endpoint of the household, with the rev the app has seen', async () => {
    const { apiFetch, result } = render();
    apiFetch.mockImplementation(async () => new Response(JSON.stringify({ rev: 7, changes: [] })));

    const first = await result.current({ since: undefined });
    const second = await result.current({ since: 5 });

    expect(apiFetch.mock.calls.map(([endpoint]) => endpoint.path)).toEqual([
      '/api/v1/households/hh-1/changes',
      '/api/v1/households/hh-1/changes?since=5',
    ]);
    expect(first).toEqual({ rev: 7, changes: [] });
    expect(second).toEqual({ rev: 7, changes: [] });
  });

  it('fails when the request fails', async () => {
    const { apiFetch, result } = render(0);
    apiFetch.mockImplementation(async () => new Response('', { status: 500 }));

    await expect(result.current({ since: 1 })).rejects.toThrow();
  });
});
