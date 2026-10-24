import { act, renderHook, waitFor } from '@testing-library/react';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useClearCheckedMutation } from './index';

describe('useClearCheckedMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('removes ticked items and refreshes the items query', async () => {
    const milk = await fakeShoppingList.addItem({
      name: 'Milk',
      shopIds: [],
    });
    await fakeShoppingList.addItem({ name: 'Eggs', shopIds: [] });
    await fakeShoppingList.updateItem({ id: milk.id, changes: { checked: true } });
    const { result } = renderHook(
      () => ({ clear: useClearCheckedMutation(), items: useItemsQuery() }),
      { wrapper: createShoppingListWrapper() },
    );
    await waitFor(() => expect(result.current.items.data).toHaveLength(2));

    await act(async () => result.current.clear.mutateAsync());

    await waitFor(() =>
      expect(result.current.items.data?.map(({ name }) => name)).toEqual(['Eggs']),
    );
  });
});
