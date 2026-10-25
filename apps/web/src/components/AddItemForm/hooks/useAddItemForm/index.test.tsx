import { act, renderHook, waitFor } from '@testing-library/react';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import {
  createShoppingListWrapper,
  renderHookWithHousehold,
} from '../../../../testUtils/createShoppingListWrapper';
import { useAddItemForm } from './index';
import type { AddItemFormState } from './types';

const renderWithShops = async (names: string[]) => {
  const ids: string[] = [];
  for (const name of names) {
    ids.push((await fakeShoppingList.createShop({ name, color: ShopColor.Mint })).id);
  }
  const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
  await waitFor(() => expect(result.current.shops).toHaveLength(names.length));
  return { result, ids };
};

const submitName = async (result: { current: AddItemFormState }, name: string) => {
  act(() => result.current.setName(name));
  act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as never));
  await waitFor(() => expect(result.current.name).toBe(''));
};

describe('useAddItemForm', () => {
  beforeEach(() => window.localStorage.clear());

  it('offers the real shops and starts with none picked, so an item goes to Unassigned', async () => {
    const { result, ids } = await renderWithShops(['Express']);

    expect(result.current.shops.map(({ id }) => id)).toEqual(ids);
    expect(result.current.shopIds).toEqual([]);
  });

  it('adds an item with no shop when none is picked', async () => {
    const { result } = await renderHookWithHousehold(() => useAddItemForm());

    await submitName(result, 'Milk');

    expect((await fakeShoppingList.listItems())[0]).toMatchObject({ name: 'Milk', shopIds: [] });
  });

  it('adds an item to every shop picked and keeps the picks for the next item', async () => {
    const { result, ids } = await renderWithShops(['Express', 'Market']);

    act(() => result.current.setShopIds(ids));
    await submitName(result, '  Milk ');

    expect((await fakeShoppingList.listItems())[0]).toMatchObject({ name: 'Milk', shopIds: ids });
    expect(result.current.shopIds).toEqual(ids);
  });

  it('only offers separate items once two or more shops are picked', async () => {
    const { result, ids } = await renderWithShops(['Express', 'Market']);

    expect(result.current.canSeparate).toBe(false);
    act(() => result.current.setShopIds(ids.slice(0, 1)));
    expect(result.current.canSeparate).toBe(false);
    act(() => result.current.setShopIds(ids));
    expect(result.current.canSeparate).toBe(true);
  });

  it('adds one item for each shop when separate items are chosen', async () => {
    const { result, ids } = await renderWithShops(['Express', 'Market']);

    act(() => {
      result.current.setShopIds(ids);
      result.current.setSeparate(true);
    });
    await submitName(result, 'Apples');

    expect(
      (await fakeShoppingList.listItems()).map(({ name, shopIds }) => ({ name, shopIds })),
    ).toEqual(ids.map((id) => ({ name: 'Apples', shopIds: [id] })));
  });

  it('adds a single item when separate is on but only one shop is picked', async () => {
    const { result, ids } = await renderWithShops(['Express']);

    act(() => {
      result.current.setShopIds(ids);
      result.current.setSeparate(true);
    });
    await submitName(result, 'Apples');

    expect(await fakeShoppingList.listItems()).toHaveLength(1);
  });

  it('keeps the name when an item cannot be added', async () => {
    const { result } = await renderHookWithHousehold(() => useAddItemForm(), {
      failMethod: 'POST',
    });

    act(() => result.current.setName('Apples'));
    await act(async () => result.current.handleSubmit({ preventDefault: vi.fn() } as never));

    expect(result.current.name).toBe('Apples');
  });

  it('starts on the shop being viewed and follows the view when it changes', async () => {
    const [express, market] = await Promise.all([
      fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint }),
      fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Sky }),
    ]);
    const initialProps: { focus: string | undefined } = { focus: express.id };
    const { result, rerender } = renderHook(
      ({ focus }: { focus: string | undefined }) => useAddItemForm(focus),
      { wrapper: createShoppingListWrapper(), initialProps },
    );
    await waitFor(() => expect(result.current.shops).toHaveLength(2));

    expect(result.current.shopIds).toEqual([express.id]);
    act(() => result.current.setShopIds([express.id, market.id]));
    rerender({ focus: market.id });
    expect(result.current.shopIds).toEqual([market.id]);
    rerender({ focus: undefined });
    expect(result.current.shopIds).toEqual([]);
  });

  it('drops a picked shop that no longer exists', async () => {
    const { result, ids } = await renderWithShops(['Express']);

    act(() => result.current.setShopIds([...ids, 'deleted-shop']));

    expect(result.current.shopIds).toEqual(ids);
  });

  it('suggests remembered names and brings back all their shops when picked', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const market = await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Sky });
    const bought = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [shop.id, market.id] });
    await fakeShoppingList.updateItem({ id: bought.id, changes: { checked: true } });
    const { result } = renderHook(() => useAddItemForm(), { wrapper: createShoppingListWrapper() });
    await waitFor(() => expect(result.current.shops).toHaveLength(2));

    act(() => result.current.setName('mi'));
    await waitFor(() =>
      expect(result.current.suggestions.map(({ name }) => name)).toEqual(['Milk']),
    );
    act(() => result.current.pickSuggestion(result.current.suggestions[0]!));

    expect(result.current.name).toBe('Milk');
    expect(result.current.shopIds).toEqual([shop.id, market.id]);
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
      await waitFor(() => expect(hook.result.current.shops).toHaveLength(1));
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
