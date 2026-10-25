import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useActiveHousehold } from '../../hooks/useActiveHousehold';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../createSession';
import { fakeShoppingListApi } from '../fakeShoppingListApi';
import { TEST_HOUSEHOLD_ID } from '../fakeShoppingList/constants';
import { TestProviders } from '../TestProviders';
import { TEST_WEB_CONFIGURATION } from '../webConfiguration';

export const answerHouseholds = (apiFetch: { mockImplementation: (fn: never) => unknown }) =>
  apiFetch.mockImplementation((async (
    endpoint: { path: string; timeoutMs: number },
    init?: RequestInit,
  ) => {
    if (endpoint.path.endsWith('/households')) {
      return new Response(
        JSON.stringify({ households: [{ id: TEST_HOUSEHOLD_ID, name: 'Home', role: 'owner' }] }),
        { status: 200 },
      );
    }
    if (endpoint.path.endsWith('/members')) {
      return new Response(
        JSON.stringify({ members: [{ id: 'sub-1', username: 'shane', role: 'owner' }] }),
        { status: 200 },
      );
    }
    return fakeShoppingListApi(endpoint, init);
  }) as never);

type ShoppingListWrapperOptions = {
  failMethod?: string;
  flags?: Partial<Record<WebFeatureFlag, boolean>>;
};

export const createShoppingListWrapper = ({
  failMethod,
  flags = {},
}: ShoppingListWrapperOptions = {}) => {
  const client = new QueryClient();
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  answerHouseholds(apiFetch);
  if (failMethod !== undefined) {
    const answer = apiFetch.getMockImplementation();
    apiFetch.mockImplementation((async (endpoint: { path: string }, init?: RequestInit) =>
      init?.method === failMethod
        ? new Response('{}', { status: 500 })
        : answer?.(endpoint as never, init)) as never);
  }
  const config = {
    ...TEST_WEB_CONFIGURATION,
    featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, ...flags },
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} client={client} config={config}>
      {children}
    </TestProviders>
  );
  return wrapper;
};

export const renderHookWithHousehold = async <T,>(
  useHookUnderTest: () => T,
  options: ShoppingListWrapperOptions = {},
) => {
  const wrapper = createShoppingListWrapper(options);
  const household = renderHook(() => useActiveHousehold(), { wrapper });
  const rendered = renderHook(useHookUnderTest, { wrapper });
  await waitFor(() => expect(household.result.current?.id).toBe(TEST_HOUSEHOLD_ID));
  return rendered;
};
