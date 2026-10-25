import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SessionStatus } from '../../services/session/constants';
import { answerHouseholds } from '../../testUtils/createShoppingListWrapper';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { SHOPS_QUERY_KEY } from '../useShopsQuery/constants';
import { ITEMS_QUERY_KEY } from '../useItemsQuery/constants';
import { useListParams } from '../useListParams';
import { useListCache } from './index';

const ITEM = {
  id: 'i1',
  name: 'Milk',
  shopIds: [],
  checked: false,
  createdAt: 1,
  addedBy: 'sub-1',
};

const setup = async () => {
  const client = new QueryClient();
  const { session, apiFetch } = createSession(SessionStatus.SignedIn);
  answerHouseholds(apiFetch);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders session={session} client={client}>
      {children}
    </TestProviders>
  );
  const { result } = renderHook(() => ({ cache: useListCache(), params: useListParams() }), {
    wrapper,
  });
  await waitFor(() => expect(result.current.params.householdId).toBe('hh-1'));
  return { client, result };
};

describe('useListCache', () => {
  it('changes the cached items and shops', async () => {
    const { client, result } = await setup();
    client.setQueryData(result.current.params.queryKeyFor(ITEMS_QUERY_KEY), { items: [ITEM] });
    client.setQueryData(result.current.params.queryKeyFor(SHOPS_QUERY_KEY), { shops: [] });

    result.current.cache.updateItems({ update: (items) => items.filter(({ id }) => id !== 'i1') });
    result.current.cache.updateShops({
      update: (shops) => [...shops, { id: 'b1', name: 'Aldi', color: 'sky', order: 0 }],
    });

    expect(client.getQueryData(result.current.params.queryKeyFor(ITEMS_QUERY_KEY))).toEqual({
      items: [],
    });
    expect(
      client.getQueryData<{ shops: unknown[] }>(result.current.params.queryKeyFor(SHOPS_QUERY_KEY))
        ?.shops,
    ).toHaveLength(1);
  });

  it('leaves a list that was never loaded alone', async () => {
    const { client, result } = await setup();

    result.current.cache.updateItems({ update: (items) => [...items, ITEM] });

    expect(client.getQueryData(result.current.params.queryKeyFor(ITEMS_QUERY_KEY))).toBeUndefined();
  });
});
