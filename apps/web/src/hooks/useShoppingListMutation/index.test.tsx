import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { TEST_HOUSEHOLD_ID } from '../../testUtils/testRepository/constants';
import type { ListItem } from '../../services/shoppingList/types';
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
      () =>
        useShoppingListMutation({
          name: MutationName.addItem,
          write,
          invalidates: ['items', 'buckets'],
        }),
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
      () =>
        useShoppingListMutation({ name: MutationName.addItem, write: vi.fn(), invalidates: [] }),
      { wrapper },
    );

    await expect(act(async () => result.current.mutateAsync())).rejects.toThrow(
      'No active household',
    );
  });

  describe('optimistic', () => {
    const ITEMS: ListItem[] = [
      { id: 'i1', name: 'Milk', bucketId: 'unsorted', checked: false, createdAt: 1 },
    ];
    const itemsKey = [ITEMS_QUERY_KEY, TEST_HOUSEHOLD_ID];

    const setup = async (write: () => Promise<string>) => {
      const client = new QueryClient();
      client.setQueryData(itemsKey, ITEMS);
      vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
      const { session, apiFetch } = createSession(SessionStatus.SignedIn);
      answerHouseholds(apiFetch);
      const wrapper = ({ children }: { children: ReactNode }) => (
        <TestProviders session={session} client={client}>
          {children}
        </TestProviders>
      );
      const household = renderHook(() => useActiveHousehold(), { wrapper });
      const { result } = renderHook(
        () =>
          useShoppingListMutation({
            name: MutationName.updateItem,
            write,
            invalidates: [ITEMS_QUERY_KEY],
            optimistic: ({ items }) => items.map((item) => ({ ...item, checked: true })),
          }),
        { wrapper },
      );
      await waitFor(() => expect(household.result.current).toBeDefined());
      return { client, result };
    };

    it('shows the change before the write finishes', async () => {
      let finish: (value: string) => void = () => undefined;
      const { client, result } = await setup(() => new Promise((resolve) => (finish = resolve)));

      act(() => {
        result.current.mutate();
      });

      await waitFor(() =>
        expect(client.getQueryData<ListItem[]>(itemsKey)?.[0]?.checked).toBe(true),
      );
      await act(async () => finish('done'));
    });

    it('puts the old items back when the write fails', async () => {
      const { client, result } = await setup(() => Promise.reject(new Error('nope')));

      await act(async () => {
        await result.current.mutateAsync().catch(() => undefined);
      });

      expect(client.getQueryData<ListItem[]>(itemsKey)).toEqual(ITEMS);
    });
  });
});
