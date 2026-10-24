import { act, renderHook, waitFor } from '@testing-library/react';
import { ShopColor, UNSORTED_SHOP_ID } from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../../../testUtils/createShoppingListWrapper';
import { useHome } from './index';

describe('useHome', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts loading with nothing on the list', () => {
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasItems).toBe(false);
  });

  it('groups items by shop and offers General as a move target', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const milk = await fakeShoppingList.addItem({ name: 'Milk', shopId: shop.id });
    const eggs = await fakeShoppingList.addItem({ name: 'Eggs', shopId: shop.id });
    await fakeShoppingList.updateItem({ id: eggs.id, changes: { checked: true } });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.hasItems).toBe(true));
    expect(result.current.grouped.sections[0]?.items).toEqual([milk]);
    expect(result.current.grouped.checked.map(({ id }) => id)).toEqual([eggs.id]);
    expect(result.current.allShops.map(({ id }) => id)).toEqual([UNSORTED_SHOP_ID, shop.id]);
  });

  it('keeps General out of the reorderable shops', async () => {
    await fakeShoppingList.addItem({ name: 'Batteries', shopId: UNSORTED_SHOP_ID });
    await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.unsorted?.items).toHaveLength(1));
    expect(result.current.reorderable.map(({ shop }) => shop.name)).toEqual(['Express']);
  });

  it('reorders the shops when one is dropped on another', async () => {
    const a = await fakeShoppingList.createShop({ name: 'A', color: ShopColor.Mint });
    const b = await fakeShoppingList.createShop({ name: 'B', color: ShopColor.Sky });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.reorderable).toHaveLength(2));

    act(() => result.current.handleDragEnd({ active: { id: a.id }, over: { id: b.id } } as never));

    await waitFor(async () =>
      expect((await fakeShoppingList.listShops()).map(({ name }) => name)).toEqual(['B', 'A']),
    );
    expect(result.current.reorderable.map(({ shop }) => shop.name)).toEqual(['B', 'A']);
  });

  it('ignores a drop that goes nowhere', async () => {
    const a = await fakeShoppingList.createShop({ name: 'A', color: ShopColor.Mint });
    await fakeShoppingList.createShop({ name: 'B', color: ShopColor.Sky });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.reorderable).toHaveLength(2));

    act(() => result.current.handleDragEnd({ active: { id: a.id }, over: null } as never));

    expect(result.current.reorderable.map(({ shop }) => shop.name)).toEqual(['A', 'B']);
  });
});
