import { act, waitFor } from '@testing-library/react';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderShoppingListMutation } from '../../testUtils/renderShoppingListMutation';
import { useDeleteItemMutation } from './index';

describe('useDeleteItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('deletes an item and refreshes the items query', async () => {
    const { id } = await fakeShoppingList.addItem({
      name: 'Milk',
      shopIds: [],
    });
    const result = await renderShoppingListMutation(() => useDeleteItemMutation(), 1);

    await act(async () => result.current.mutation.mutateAsync(id));

    await waitFor(() => expect(result.current.items.data).toEqual([]));
  });
});
