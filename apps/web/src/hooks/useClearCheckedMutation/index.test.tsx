import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
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

  it('tells the user when the ticked items could not be cleared, and brings them back', async () => {
    const milk = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
    await fakeShoppingList.updateItem({ id: milk.id, changes: { checked: true } });
    const { result } = renderHook(
      () => ({ clear: useClearCheckedMutation(), items: useItemsQuery() }),
      { wrapper: createShoppingListWrapper({ failMethod: 'DELETE' }) },
    );
    await waitFor(() => expect(result.current.items.data).toHaveLength(1));

    await act(async () => result.current.clear.mutateAsync().catch(() => undefined));

    expect(await screen.findByText(ITEM_FAILURE_COPY.clearTicked)).toBeInTheDocument();
    await waitFor(() => expect(result.current.items.data).toHaveLength(1));
  });
});
