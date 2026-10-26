import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { useChangesQuery } from '.';

const render = (getSince: () => number | undefined) => {
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  apiFetch.mockImplementation(async () => new Response(JSON.stringify({ rev: 3, snapshot: true })));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} client={new QueryClient()}>
      {children}
    </TestProviders>
  );
  return {
    apiFetch,
    ...renderHook(() => useChangesQuery({ householdId: 'hh-1', getSince }), { wrapper }),
  };
};

describe('useChangesQuery', () => {
  it('asks nothing until it is told to', () => {
    const { apiFetch } = render(() => undefined);

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('asks for the changes since the rev known at that moment', async () => {
    const since = { value: undefined as number | undefined };
    const { apiFetch, result } = render(() => since.value);

    await result.current.refetch();
    since.value = 4;
    await result.current.refetch();

    expect(apiFetch.mock.calls.map(([endpoint]) => endpoint.path)).toEqual([
      '/api/v1/households/hh-1/changes',
      '/api/v1/households/hh-1/changes?since=4',
    ]);
  });
});
