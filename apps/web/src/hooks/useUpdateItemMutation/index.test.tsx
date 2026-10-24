import { act, renderHook, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { testRepository } from '../../testUtils/testRepository';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useUpdateItemMutation } from './index';

describe('useUpdateItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('ticks an item and refreshes the items query', async () => {
    const { id } = await testRepository.addItem({
      name: 'Milk',
      bucketId: UNSORTED_BUCKET_ID,
    });
    const { result } = renderHook(
      () => ({ update: useUpdateItemMutation(), items: useItemsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.items.data).toHaveLength(1));

    await act(async () => result.current.update.mutateAsync({ id, changes: { checked: true } }));

    await waitFor(() => expect(result.current.items.data?.[0]?.checked).toBe(true));
  });
});
