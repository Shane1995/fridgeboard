import { act, renderHook, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { testRepository } from '../../testUtils/testRepository';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useDeleteItemMutation } from './index';

describe('useDeleteItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('deletes an item and refreshes the items query', async () => {
    const { id } = await testRepository.addItem({
      name: 'Milk',
      bucketId: UNSORTED_BUCKET_ID,
    });
    const { result } = renderHook(
      () => ({ remove: useDeleteItemMutation(), items: useItemsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.items.data).toHaveLength(1));

    await act(async () => result.current.remove.mutateAsync(id));

    await waitFor(() => expect(result.current.items.data).toEqual([]));
  });
});
