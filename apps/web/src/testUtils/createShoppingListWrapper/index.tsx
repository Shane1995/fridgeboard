import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useActiveHousehold } from '../../hooks/useActiveHousehold';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../createSession';
import { TEST_HOUSEHOLD_ID } from '../testRepository';
import { TestProviders } from '../TestProviders';

export const answerHouseholds = (apiFetch: { mockImplementation: (fn: never) => unknown }) =>
  apiFetch.mockImplementation((async ({ path }: { path: string }) =>
    path.endsWith('/households')
      ? new Response(
          JSON.stringify({ households: [{ id: TEST_HOUSEHOLD_ID, name: 'Home', role: 'owner' }] }),
          { status: 200 },
        )
      : new Response('{}', { status: 404 })) as never);

export const createShoppingListWrapper = () => {
  const client = new QueryClient();
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  answerHouseholds(apiFetch);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} client={client}>
      {children}
    </TestProviders>
  );
  return wrapper;
};

export const renderHookWithHousehold = async <T,>(useHookUnderTest: () => T) => {
  const wrapper = createShoppingListWrapper();
  const household = renderHook(() => useActiveHousehold(), { wrapper });
  const rendered = renderHook(useHookUnderTest, { wrapper });
  await waitFor(() => expect(household.result.current).toBe(TEST_HOUSEHOLD_ID));
  return rendered;
};
