import { act, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderShoppingListMutation } from '../../testUtils/renderShoppingListMutation';
import { useDeleteItemMutation } from './index';

describe('useDeleteItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('deletes an item and refreshes the items query', async () => {
    const { id } = await fakeShoppingList.addItem({
      name: 'Milk',
      bucketId: UNSORTED_BUCKET_ID,
    });
    const result = await renderShoppingListMutation(() => useDeleteItemMutation(), 1);

    await act(async () => result.current.mutation.mutateAsync(id));

    await waitFor(() => expect(result.current.items.data).toEqual([]));
  });
});
