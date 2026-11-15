import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { ClearItemsBy, ITEM_FAILURE_COPY } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useClearItemsMutation } from './index';

const setup = async (options: Parameters<typeof createShoppingListWrapper>[0] = {}) => {
  const milk = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
  await fakeShoppingList.addItem({ name: 'Eggs', shopIds: [] });
  await fakeShoppingList.updateItem({ id: milk.id, changes: { checked: true } });
  const view = renderHook(() => ({ clear: useClearItemsMutation(), items: useItemsQuery() }), {
    wrapper: createShoppingListWrapper(options),
  });
  await waitFor(() => expect(view.result.current.items.data).toHaveLength(2));
  return view;
};

const names = (view: Awaited<ReturnType<typeof setup>>) =>
  view.result.current.items.data?.map(({ name }) => name);

describe('useClearItemsMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('removes only the ticked items with one request', async () => {
    const view = await setup();

    await act(async () => view.result.current.clear.mutateAsync(ClearItemsBy.Checked));

    await waitFor(() => expect(names(view)).toEqual(['Eggs']));
    expect(await fakeShoppingList.listItems()).toHaveLength(1);
  });

  it('removes every item when clearing all', async () => {
    const view = await setup();

    await act(async () => view.result.current.clear.mutateAsync(ClearItemsBy.All));

    await waitFor(() => expect(names(view)).toEqual([]));
    expect(await fakeShoppingList.listItems()).toEqual([]);
  });

  it('tells the user when the ticked items could not be cleared, and brings them back', async () => {
    const view = await setup({ failMethod: 'DELETE' });

    await act(async () =>
      view.result.current.clear.mutateAsync(ClearItemsBy.Checked).catch(() => undefined),
    );

    expect(await screen.findByText(ITEM_FAILURE_COPY.clearTicked)).toBeInTheDocument();
    await waitFor(() => expect(view.result.current.items.data).toHaveLength(2));
  });

  it('tells the user when the list could not be cleared', async () => {
    const view = await setup({ failMethod: 'DELETE' });

    await act(async () =>
      view.result.current.clear.mutateAsync(ClearItemsBy.All).catch(() => undefined),
    );

    expect(await screen.findByText(ITEM_FAILURE_COPY.clearAll)).toBeInTheDocument();
    await waitFor(() => expect(view.result.current.items.data).toHaveLength(2));
  });
});
