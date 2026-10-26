import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { ShopColor, UNSORTED_SHOP_ID } from '../../../../services/shoppingList/constants';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import type { ListItem } from '../../../../services/shoppingList/types';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import {
  createShoppingListWrapper,
  renderHookWithHousehold,
} from '../../../../testUtils/createShoppingListWrapper';
import { useHome } from './index';

describe('useHome', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts loading with nothing on the list', () => {
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasItems).toBe(false);
  });

  it('stops loading once the list has arrived, and says when it is empty', async () => {
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it('does not call the list empty while it is still loading', () => {
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    expect(result.current.isEmpty).toBe(false);
  });

  it('groups items by shop and offers General as a move target', async () => {
    const shop = await fakeShoppingList.createShop({
      name: 'Express',
      color: ShopColor.Mint,
    });
    const milk = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [shop.id] });
    const eggs = await fakeShoppingList.addItem({ name: 'Eggs', shopIds: [shop.id] });
    await fakeShoppingList.updateItem({ id: eggs.id, changes: { checked: true } });
    const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });

    await waitFor(() => expect(result.current.hasItems).toBe(true));
    expect(result.current.grouped.sections[0]?.items.map(({ id }) => id)).toEqual([milk.id]);
    expect(result.current.grouped.checked.map(({ id }) => id)).toEqual([eggs.id]);
    expect(result.current.allShops.map(({ id }) => id)).toEqual([UNSORTED_SHOP_ID, shop.id]);
  });

  it('keeps General out of the reorderable shops', async () => {
    await fakeShoppingList.addItem({ name: 'Batteries', shopIds: [] });
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

    act(() =>
      result.current.handleDragEnd({
        active: { id: a.id, data: { current: { type: 'shop' } } },
        over: { id: b.id, data: { current: { type: 'shop' } } },
      } as never),
    );

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

    act(() =>
      result.current.handleDragEnd({
        active: { id: a.id, data: { current: { type: 'shop' } } },
        over: null,
      } as never),
    );

    expect(result.current.reorderable.map(({ shop }) => shop.name)).toEqual(['A', 'B']);
  });

  describe('dragging a shop', () => {
    const shopDrag = (id: string) => ({ id, data: { current: { type: 'shop' } } });

    const setUp = async () => {
      const a = await fakeShoppingList.createShop({ name: 'A', color: ShopColor.Mint });
      await fakeShoppingList.createShop({ name: 'B', color: ShopColor.Sky });
      const { result } = renderHook(() => useHome(), { wrapper: createShoppingListWrapper() });
      await waitFor(() => expect(result.current.reorderable).toHaveLength(2));
      return { a, result };
    };

    it('remembers which shop is being dragged, for the lifted preview', async () => {
      const { a, result } = await setUp();

      act(() => result.current.handleDragStart({ active: shopDrag(a.id) } as never));

      expect(result.current.activeShop?.shop.id).toBe(a.id);
      expect(result.current.activeItem).toBeUndefined();
    });

    it('forgets it when the drag is cancelled', async () => {
      const { a, result } = await setUp();
      act(() => result.current.handleDragStart({ active: shopDrag(a.id) } as never));

      act(() => result.current.handleDragCancel());

      expect(result.current.activeShop).toBeUndefined();
    });

    it('forgets it when the shop is dropped', async () => {
      const { a, result } = await setUp();
      act(() => result.current.handleDragStart({ active: shopDrag(a.id) } as never));

      act(() => result.current.handleDragEnd({ active: shopDrag(a.id), over: null } as never));

      expect(result.current.activeShop).toBeUndefined();
    });
  });

  describe('dragging an item', () => {
    const DRAG = { [WebFeatureFlag.ENABLE_ITEM_DRAG]: true };

    const dragged = (item: ListItem, fromShopId: string) => ({
      id: `item:${item.id}:${fromShopId}`,
      data: { current: { type: 'item', item, fromShopId } },
    });
    const zone = (shopId: string) => ({
      id: `drop:${shopId}`,
      data: { current: { type: 'shop-drop', shopId } },
    });

    const setUp = async () => {
      const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
      const aldi = await fakeShoppingList.createShop({ name: 'Aldi', color: ShopColor.Pink });
      const tape = await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });
      const apples = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id] });
      const { result } = await renderHookWithHousehold(() => useHome(), { flags: DRAG });
      await waitFor(() => expect(result.current.hasItems).toBe(true));
      return { tesco, aldi, tape, apples, result };
    };

    it('only allows it when the flag is on and no single shop is being viewed', async () => {
      const { result, tesco } = await setUp();
      expect(result.current.canDragItems).toBe(true);

      act(() => result.current.setFocus(tesco.id));

      expect(result.current.canDragItems).toBe(false);
    });

    it('allows quick add with its flag, in every view', async () => {
      await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });
      const { result } = await renderHookWithHousehold(() => useHome(), {
        flags: { [WebFeatureFlag.ENABLE_SHOP_QUICK_ADD]: true },
      });
      await waitFor(() => expect(result.current.hasItems).toBe(true));
      expect(result.current.canQuickAdd).toBe(true);

      act(() => result.current.setFocus(UNSORTED_SHOP_ID));

      expect(result.current.canQuickAdd).toBe(true);
    });

    it('refreshes the list only when its flag is on', async () => {
      await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });
      const on = await renderHookWithHousehold(() => useHome(), {
        flags: { [WebFeatureFlag.ENABLE_PULL_TO_REFRESH]: true },
      });
      await waitFor(() => expect(on.result.current.hasItems).toBe(true));
      expect(on.result.current.canPullToRefresh).toBe(true);
      await act(async () => on.result.current.refresh());
      expect(on.result.current.hasItems).toBe(true);

      const off = await renderHookWithHousehold(() => useHome());
      await waitFor(() => expect(off.result.current.hasItems).toBe(true));
      expect(off.result.current.canPullToRefresh).toBe(false);
    });

    it('is off without the flag', async () => {
      await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });
      const { result } = await renderHookWithHousehold(() => useHome());
      await waitFor(() => expect(result.current.hasItems).toBe(true));

      expect(result.current.canDragItems).toBe(false);
    });

    it('remembers the item being dragged, and forgets it when the drag ends or is cancelled', async () => {
      const { result, tape } = await setUp();

      act(() => result.current.handleDragStart({ active: dragged(tape, 'unsorted') } as never));
      expect(result.current.activeItem?.id).toBe(tape.id);
      act(() => result.current.handleDragCancel());
      expect(result.current.activeItem).toBeUndefined();

      act(() => result.current.handleDragStart({ active: dragged(tape, 'unsorted') } as never));
      act(() =>
        result.current.handleDragEnd({ active: dragged(tape, 'unsorted'), over: null } as never),
      );
      expect(result.current.activeItem).toBeUndefined();
    });

    it('assigns an unassigned item to the shop it is dropped on', async () => {
      const { result, tape, tesco } = await setUp();

      act(() =>
        result.current.handleDragEnd({
          active: dragged(tape, 'unsorted'),
          over: zone(tesco.id),
        } as never),
      );

      await waitFor(async () =>
        expect(
          (await fakeShoppingList.listItems()).find(({ id }) => id === tape.id)?.shopIds,
        ).toEqual([tesco.id]),
      );
    });

    it('asks what to do when an item is dropped on a different shop', async () => {
      const { result, apples, tesco, aldi } = await setUp();

      act(() =>
        result.current.handleDragEnd({
          active: dragged(apples, tesco.id),
          over: zone(aldi.id),
        } as never),
      );

      expect(await screen.findByText('Apples is in Tesco')).toBeInTheDocument();
    });

    it('does nothing when dropped outside every card, or on a shop reorder target', async () => {
      const { result, tape, tesco } = await setUp();

      act(() =>
        result.current.handleDragEnd({ active: dragged(tape, 'unsorted'), over: null } as never),
      );
      act(() =>
        result.current.handleDragEnd({
          active: dragged(tape, 'unsorted'),
          over: { id: tesco.id, data: { current: { type: 'shop' } } },
        } as never),
      );

      expect(
        (await fakeShoppingList.listItems()).find(({ id }) => id === tape.id)?.shopIds,
      ).toEqual([]);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
