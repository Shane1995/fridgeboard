import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MutationName } from '../../services/configuration/schema/constants';
import { SessionStatus } from '../../services/session/constants';
import { answerHouseholds } from '../../testUtils/createShoppingListWrapper';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { useActiveHousehold } from '../useActiveHousehold';
import { useShoppingListMutation } from './index';

describe('useShoppingListMutation', () => {
  it('runs the write and then invalidates each named query', async () => {
    const client = new QueryClient();
    const order: string[] = [];
    vi.spyOn(client, 'invalidateQueries').mockImplementation(async (filters) => {
      order.push(`invalidate ${String(filters?.queryKey?.[0])}`);
    });
    const write = vi.fn(async () => {
      order.push('write');
      return 'done';
    });
    const { session, apiFetch } = createSession(SessionStatus.SignedIn);
    answerHouseholds(apiFetch);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders session={session} client={client}>
        {children}
      </TestProviders>
    );
    const household = renderHook(() => useActiveHousehold(), { wrapper });
    const { result } = renderHook(
      () => useShoppingListMutation(MutationName.addItem, write, ['items', 'buckets']),
      { wrapper },
    );
    await waitFor(() => expect(household.result.current).toBeDefined());

    const data = await act(async () => result.current.mutateAsync());

    expect(data).toBe('done');
    expect(order).toEqual(['write', 'invalidate items', 'invalidate buckets']);
  });

  it('refuses to write before a household is known', async () => {
    const { session } = createSession(SessionStatus.SignedIn);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders session={session}>{children}</TestProviders>
    );
    const { result } = renderHook(
      () => useShoppingListMutation(MutationName.addItem, vi.fn(), []),
      { wrapper },
    );

    await expect(act(async () => result.current.mutateAsync())).rejects.toThrow(
      'No active household',
    );
  });
});
