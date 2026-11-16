import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { ITEM_FAILURE_COPY, ITEM_SUCCESS_COPY } from '../../services/shoppingList/constants';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../useItemsQuery';
import { useAddItemMutation } from './index';

const renderAdd = async (options: { failMethod?: string; quiet?: boolean } = {}) => {
  const { quiet, ...wrapperOptions } = options;
  const rendered = renderHook(
    () => ({ add: useAddItemMutation({ quiet }), items: useItemsQuery() }),
    { wrapper: createShoppingListWrapper(wrapperOptions) },
  );
  await waitFor(() => expect(rendered.result.current.items.data).toEqual([]));
  await act(async () => rendered.result.current.add.mutateAsync({ name: 'Milk', shopIds: [] }));
  return rendered.result;
};

describe('useAddItemMutation', () => {
  beforeEach(() => window.localStorage.clear());

  it('adds an item and refreshes the items query', async () => {
    const result = await renderAdd();

    await waitFor(() =>
      expect(result.current.items.data?.map(({ name }) => name)).toEqual(['Milk']),
    );
  });

  it('tells the user when the item could not be added', async () => {
    const result = await renderAdd({ failMethod: 'POST' });

    expect(await screen.findByText(ITEM_FAILURE_COPY.add('Milk'))).toBeInTheDocument();
    expect(result.current.items.data).toEqual([]);
  });

  it('tells the user the item was added', async () => {
    await renderAdd();

    expect(await screen.findByText(ITEM_SUCCESS_COPY.add('Milk'))).toBeInTheDocument();
  });

  it('stays quiet when asked to', async () => {
    const result = await renderAdd({ quiet: true });

    await waitFor(() => expect(result.current.items.data).toHaveLength(1));
    expect(screen.queryByText(ITEM_SUCCESS_COPY.add('Milk'))).not.toBeInTheDocument();
  });
});
