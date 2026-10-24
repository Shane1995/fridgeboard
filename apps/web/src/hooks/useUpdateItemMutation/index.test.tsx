import { act, waitFor } from '@testing-library/react';
import { UNSORTED_BUCKET_ID } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderShoppingListMutation } from '../../testUtils/renderShoppingListMutation';
import { useUpdateItemMutation } from './index';

describe('useUpdateItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('ticks an item and refreshes the items query', async () => {
    const { id } = await fakeShoppingList.addItem({
      name: 'Milk',
      bucketId: UNSORTED_BUCKET_ID,
    });
    const result = await renderShoppingListMutation(() => useUpdateItemMutation(), 1);

    await act(async () => result.current.mutation.mutateAsync({ id, changes: { checked: true } }));

    await waitFor(() => expect(result.current.items.data?.[0]?.checked).toBe(true));
  });
});
