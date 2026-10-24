import { act, renderHook, waitFor } from '@testing-library/react';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useAddItemMutation } from './index';

describe('useAddItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('adds an item and refreshes the items query', async () => {
    const { result } = renderHook(() => ({ add: useAddItemMutation(), items: useItemsQuery() }), {
      wrapper: createShoppingListWrapper(),
    });
    await waitFor(() => expect(result.current.items.data).toEqual([]));

    await act(async () => result.current.add.mutateAsync({ name: 'Milk', shopIds: [] }));

    await waitFor(() =>
      expect(result.current.items.data?.map(({ name }) => name)).toEqual(['Milk']),
    );
  });
});
