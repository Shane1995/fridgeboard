import { act, renderHook, waitFor } from '@testing-library/react';
import {
  ShopColor,
  LAST_SHOP_STORAGE_KEY,
  UNSORTED_SHOP_ID,
} from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import { createShoppingListWrapper } from '../../../../testUtils/createShoppingListWrapper';
import { useAddItemForm } from './index';

describe('useAddItemForm', () => {
  beforeEach(() => window.localStorage.clear());

  it('offers General first and defaults to it', async () => {
    await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.shops).toHaveLength(2));
    expect(result.current.shops[0]?.id).toBe(UNSORTED_SHOP_ID);
    expect(result.current.shopId).toBe(UNSORTED_SHOP_ID);
  });

  it('adds the trimmed name to the chosen shop, clears the input and remembers the shop', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.shops).toHaveLength(2));

    act(() => {
      result.current.setShopId(shop.id);
      result.current.setName('  Milk ');
    });
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

    await waitFor(() => expect(result.current.name).toBe(''));
    expect((await fakeShoppingList.listItems())[0]).toMatchObject({
      name: 'Milk',
      shopId: shop.id,
    });
    expect(window.localStorage.getItem(LAST_SHOP_STORAGE_KEY)).toBe(shop.id);
  });

  it('suggests remembered names and brings back their shop when picked', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const bought = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [shop.id] });
    await fakeShoppingList.updateItem({ id: bought.id, changes: { checked: true } });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.shops).toHaveLength(2));

    act(() => result.current.setName('mi'));
    await waitFor(() =>
      expect(result.current.suggestions.map(({ name }) => name)).toEqual(['Milk']),
    );
    act(() => result.current.pickSuggestion(result.current.suggestions[0]!));

    expect(result.current.name).toBe('Milk');
    expect(result.current.shopId).toBe(shop.id);
    await waitFor(() => expect(result.current.suggestions).toEqual([]));
  });

  it('does not suggest an item that is already on the list', async () => {
    await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
    const mince = await fakeShoppingList.addItem({
      name: 'Mince',
      shopIds: [],
    });
    await fakeShoppingList.updateItem({ id: mince.id, changes: { checked: true } });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });

    act(() => result.current.setName('mi'));

    await waitFor(() =>
      expect(result.current.suggestions.map(({ name }) => name)).toEqual(['Mince']),
    );
  });

  it('ignores a blank name', async () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });

    act(() => result.current.setName('   '));
    act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

    expect(await fakeShoppingList.listItems()).toEqual([]);
  });

  describe('keyboard', () => {
    const key = (name: string) => ({ key: name, preventDefault: vi.fn() }) as never;

    const setUp = async () => {
      const shop = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
      for (const name of ['Milk', 'Mince']) {
        const bought = await fakeShoppingList.addItem({ name, shopIds: [shop.id] });
        await fakeShoppingList.updateItem({ id: bought.id, changes: { checked: true } });
      }
      const hook = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
      await waitFor(() => expect(hook.result.current.shops).toHaveLength(2));
      act(() => hook.result.current.setName('mi'));
      await waitFor(() => expect(hook.result.current.suggestions).toHaveLength(2));
      return hook.result;
    };

    it('highlights nothing until an arrow key is pressed', async () => {
      const result = await setUp();

      expect(result.current.highlighted).toBe(-1);
      act(() => result.current.handleKeyDown(key('ArrowDown')));
      expect(result.current.highlighted).toBe(0);
    });

    it('moves the highlight within the suggestions', async () => {
      const result = await setUp();

      act(() => result.current.handleKeyDown(key('ArrowDown')));
      act(() => result.current.handleKeyDown(key('ArrowDown')));
      act(() => result.current.handleKeyDown(key('ArrowDown')));
      expect(result.current.highlighted).toBe(1);
      act(() => result.current.handleKeyDown(key('ArrowUp')));
      expect(result.current.highlighted).toBe(0);
      act(() => result.current.handleKeyDown(key('ArrowUp')));
      expect(result.current.highlighted).toBe(-1);
    });

    it('picks the highlighted suggestion on Enter instead of submitting', async () => {
      const result = await setUp();
      const enter = key('Enter');

      act(() => result.current.handleKeyDown(key('ArrowDown')));
      const expected = result.current.suggestions[0]!.name;
      act(() => result.current.handleKeyDown(enter));

      expect(result.current.name).toBe(expected);
      expect(result.current.highlighted).toBe(-1);
      expect((enter as { preventDefault: () => void }).preventDefault).toHaveBeenCalled();
    });

    it('leaves Enter alone when nothing is highlighted', async () => {
      const result = await setUp();
      const enter = key('Enter');

      act(() => result.current.handleKeyDown(enter));

      expect(result.current.name).toBe('mi');
      expect((enter as { preventDefault: () => void }).preventDefault).not.toHaveBeenCalled();
    });

    it('clears the highlight when the text changes', async () => {
      const result = await setUp();

      act(() => result.current.handleKeyDown(key('ArrowDown')));
      act(() => result.current.setName('min'));

      expect(result.current.highlighted).toBe(-1);
    });
  });
});
