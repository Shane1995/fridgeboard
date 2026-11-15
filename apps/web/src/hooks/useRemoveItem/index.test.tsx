import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { shopIdsOf } from '../../services/shoppingList/utils/shopIdsOf';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderHookWithHousehold } from '../../testUtils/createShoppingListWrapper';
import { REMOVE_ITEM_COPY } from './constants';
import { useRemoveItem } from './index';

const setUp = async (options: { failMethod?: string } = {}) => {
  const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
  const milk = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [tesco.id] });
  const { result } = await renderHookWithHousehold(() => useRemoveItem(), options);
  return { tesco, milk, result };
};

describe('useRemoveItem', () => {
  it('deletes the item and offers Undo', async () => {
    const { milk, result } = await setUp();

    await act(async () => result.current(milk));

    expect(await screen.findByText(REMOVE_ITEM_COPY.removed('Milk'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: REMOVE_ITEM_COPY.undo })).toBeInTheDocument();
    expect(await fakeShoppingList.listItems()).toEqual([]);
  });

  it('puts the item back in the same shops when Undo is pressed', async () => {
    const { tesco, milk, result } = await setUp();
    await act(async () => result.current(milk));

    fireEvent.click(await screen.findByRole('button', { name: REMOVE_ITEM_COPY.undo }));

    await waitFor(async () => {
      const items = await fakeShoppingList.listItems();
      expect(items.map(({ name }) => name)).toEqual(['Milk']);
      expect(items.map((item) => shopIdsOf(item))).toEqual([[tesco.id]]);
    });
  });

  it('does not say the item was added again after Undo', async () => {
    const { milk, result } = await setUp();
    await act(async () => result.current(milk));

    fireEvent.click(await screen.findByRole('button', { name: REMOVE_ITEM_COPY.undo }));

    await waitFor(async () => expect(await fakeShoppingList.listItems()).toHaveLength(1));
    expect(screen.queryByText('Added Milk')).not.toBeInTheDocument();
  });

  it('says nothing when the delete fails', async () => {
    const { milk, result } = await setUp({ failMethod: 'DELETE' });

    await act(async () => result.current(milk));

    expect(screen.queryByText(REMOVE_ITEM_COPY.removed('Milk'))).not.toBeInTheDocument();
  });
});
