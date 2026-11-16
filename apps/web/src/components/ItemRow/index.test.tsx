import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop, ListItem } from '../../services/shoppingList/types';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../../hooks/useItemsQuery';
import { shopIdsOf } from '../../services/shoppingList/utils/shopIdsOf';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { ITEM_ROW_COPY } from './constants';
import { ItemRow } from './index';

const ITEM: ListItem = {
  id: 'i1',
  name: 'Milk',
  shops: [],
  checked: false,
  createdAt: 0,
};
const EXPRESS: Shop = { id: 'b1', name: 'Express', color: ShopColor.Mint, order: 0 };

const renderRow = (shops: Shop[] = [EXPRESS]) => {
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <ul>
        <ItemRow item={ITEM} shops={shops} />
      </ul>
    </Wrapper>,
  );
};

describe('ItemRow', () => {
  it('shows the item with a tick box', () => {
    renderRow();

    expect(screen.getByRole('checkbox', { name: 'Milk' })).not.toBeChecked();
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('offers Info, Shops and Delete in the menu, with the shops one step further in', async () => {
    renderRow();

    fireEvent.click(screen.getByRole('button', { name: ITEM_ROW_COPY.menu }));

    expect(await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.info })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.shops })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.delete })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Express' })).not.toBeInTheDocument();
  });

  it('leaves out Shops when there are no shops to choose', async () => {
    renderRow([]);

    fireEvent.click(screen.getByRole('button', { name: ITEM_ROW_COPY.menu }));

    expect(await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.info })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: ITEM_ROW_COPY.shops })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.delete })).toBeInTheDocument();
  });

  describe('choosing shops from the item menu', () => {
    const ALDI: Shop = { id: 'b2', name: 'Aldi', color: ShopColor.Pink, order: 1 };

    const choose = (item: HTMLElement) => {
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyUp(item, { key: 'Enter' });
    };

    const openShops = async () => {
      const Wrapper = createShoppingListWrapper();
      render(
        <Wrapper>
          <ul>
            <ItemRow item={ITEM} shops={[EXPRESS, ALDI]} />
          </ul>
        </Wrapper>,
      );
      fireEvent.click(screen.getByRole('button', { name: ITEM_ROW_COPY.menu }));
      choose(await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.shops }));
    };

    it('keeps the shop list open after one shop is ticked, so several can be chosen', async () => {
      await openShops();

      choose(await screen.findByRole('menuitemcheckbox', { name: 'Express' }));

      expect(screen.getByRole('menuitemcheckbox', { name: 'Aldi' })).toBeInTheDocument();
    });
  });

  describe('where else the item can be got', () => {
    const SAINSBURYS: Shop = { id: 'b3', name: 'Sainsburys', color: ShopColor.Mustard, order: 2 };
    const ALDI: Shop = { id: 'b4', name: 'Aldi', color: ShopColor.Pink, order: 3 };
    const TESCO: Shop = { id: 'b5', name: 'Tesco', color: ShopColor.Grape, order: 4 };
    const MARKET: Shop = { id: 'b2', name: 'Market', color: ShopColor.Sky, order: 1 };
    const ALL = [EXPRESS, MARKET, SAINSBURYS, ALDI, TESCO];

    const renderIn = (item: ListItem, shopId?: string) => {
      const Wrapper = createShoppingListWrapper();
      render(
        <Wrapper>
          <ul>
            <ItemRow item={item} shops={ALL} {...(shopId === undefined ? {} : { shopId })} />
          </ul>
        </Wrapper>,
      );
    };

    it('shows the other shops an item is in, not the one it is listed under', () => {
      renderIn({ ...ITEM, shops: [EXPRESS, MARKET] }, 'b1');

      expect(
        screen.getByRole('img', { name: ITEM_ROW_COPY.alsoIn(['Market']) }),
      ).toBeInTheDocument();
    });

    it('shows nothing extra for an item that is only in the shop it is listed under', () => {
      renderIn({ ...ITEM, shops: [EXPRESS] }, 'b1');

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows every shop when the row is not listed under one, like the ticked list', () => {
      renderIn({ ...ITEM, shops: [EXPRESS, MARKET] });

      expect(
        screen.getByRole('img', { name: ITEM_ROW_COPY.alsoIn(['Express', 'Market']) }),
      ).toBeInTheDocument();
    });

    it('shows a count for the shops that do not fit', () => {
      renderIn({ ...ITEM, shops: ALL }, 'b1');

      expect(
        screen.getByRole('img', {
          name: ITEM_ROW_COPY.alsoIn(['Market', 'Sainsburys', 'Aldi', 'Tesco']),
        }),
      ).toHaveTextContent('+1');
    });
  });

  describe('splitting and combining', () => {
    const MARKET: Shop = { id: 'b2', name: 'Market', color: ShopColor.Sky, order: 1 };

    const choose = (item: HTMLElement) => {
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyUp(item, { key: 'Enter' });
    };

    const LoadedMarker = () => {
      const { isSuccess } = useItemsQuery();
      return isSuccess ? <span data-testid="list-loaded" /> : null;
    };

    const renderStored = async (stored: ListItem, shops: Shop[], shopId?: string) => {
      const Wrapper = createShoppingListWrapper();
      render(
        <Wrapper>
          <LoadedMarker />
          <ul>
            <ItemRow item={stored} shops={shops} {...(shopId === undefined ? {} : { shopId })} />
          </ul>
        </Wrapper>,
      );
      await screen.findByTestId('list-loaded');
      fireEvent.click(screen.getByRole('button', { name: ITEM_ROW_COPY.menu }));
      await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.info });
    };

    it('offers Split into every shop for an item in two shops when no shop is in context', async () => {
      await renderStored({ ...ITEM, shops: [EXPRESS, MARKET] }, [EXPRESS, MARKET]);

      expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.splitAll })).toBeInTheDocument();
    });

    it('leaves Split out for an item in one shop', async () => {
      await renderStored({ ...ITEM, shops: [EXPRESS] }, [EXPRESS, MARKET]);

      expect(
        screen.queryByRole('menuitem', { name: ITEM_ROW_COPY.splitAll }),
      ).not.toBeInTheDocument();
    });

    it('makes one item for each shop when Split into every shop is chosen', async () => {
      const express = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
      const market = await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Sky });
      const apples = await fakeShoppingList.addItem({
        name: 'Apples',
        shopIds: [express.id, market.id],
      });
      await renderStored(
        apples,
        [express, market].map((shop, order) => ({ ...shop, order })),
      );

      choose(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.splitAll }));

      await waitFor(async () => expect(await fakeShoppingList.listItems()).toHaveLength(2));
    });

    it('offers only Split out of this shop for an item in two shops, viewed from one of them', async () => {
      await renderStored({ ...ITEM, shops: [EXPRESS, MARKET] }, [EXPRESS, MARKET], 'b1');

      expect(
        screen.getByRole('menuitem', { name: ITEM_ROW_COPY.splitOut('Express') }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: ITEM_ROW_COPY.splitAll }),
      ).not.toBeInTheDocument();
    });

    it('offers both Split out of this shop and Split into every shop for an item in three', async () => {
      const third: Shop = { id: 'b3', name: 'Aldi', color: ShopColor.Pink, order: 2 };
      await renderStored(
        { ...ITEM, shops: [EXPRESS, MARKET, third] },
        [EXPRESS, MARKET, third],
        'b1',
      );

      expect(
        screen.getByRole('menuitem', { name: ITEM_ROW_COPY.splitOut('Express') }),
      ).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.splitAll })).toBeInTheDocument();
    });

    it('splits the item out of the shop it is viewed from and leaves the other shop on the original', async () => {
      const express = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
      const market = await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Sky });
      const apples = await fakeShoppingList.addItem({
        name: 'Apples',
        shopIds: [express.id, market.id],
      });
      await renderStored(
        apples,
        [express, market].map((shop, order) => ({ ...shop, order })),
        express.id,
      );

      choose(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.splitOut('Express') }));

      await waitFor(async () =>
        expect((await fakeShoppingList.listItems()).map((item) => shopIdsOf(item)).sort()).toEqual([
          [express.id],
          [market.id],
        ]),
      );
    });

    it('offers Combine when another unticked item has the same name', async () => {
      const first = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [] });
      await fakeShoppingList.addItem({ name: 'apples', shopIds: [] });
      await renderStored(first, [EXPRESS]);

      await waitFor(() =>
        expect(
          screen.getByRole('menuitem', { name: ITEM_ROW_COPY.combine(1) }),
        ).toBeInTheDocument(),
      );
    });

    it('leaves Combine out when the name is unique', async () => {
      const only = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [] });
      await fakeShoppingList.addItem({ name: 'Pears', shopIds: [] });
      await renderStored(only, [EXPRESS]);

      expect(screen.queryByRole('menuitem', { name: /^Combine/ })).not.toBeInTheDocument();
    });

    it('merges the same-name items into one when Combine is chosen', async () => {
      const first = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [] });
      await fakeShoppingList.addItem({ name: 'Apples', shopIds: [] });
      await renderStored(first, [EXPRESS]);

      choose(await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.combine(1) }));

      await waitFor(async () => expect(await fakeShoppingList.listItems()).toHaveLength(1));
    });
  });

  describe('swiping to delete', () => {
    const useCoarsePointer = (coarse: boolean) =>
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: coarse && query === '(pointer: coarse)',
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }));

    const Loaded = () => (useItemsQuery().isSuccess ? <span data-testid="swipe-loaded" /> : null);

    const renderSwipeable = async (stored: ListItem) => {
      const Wrapper = createShoppingListWrapper();
      render(
        <Wrapper>
          <Loaded />
          <ul>
            <ItemRow item={stored} shops={[EXPRESS]} />
          </ul>
        </Wrapper>,
      );
      await screen.findByTestId('swipe-loaded');
    };

    const drag = ({ to }: { to: number }) => {
      const row = screen.getByRole('button', { name: 'Milk' });
      fireEvent.pointerDown(row, { pointerId: 1, clientX: 300, clientY: 0 });
      fireEvent.pointerMove(row, { pointerId: 1, clientX: to, clientY: 0 });
      fireEvent.pointerUp(row, { pointerId: 1, clientX: to, clientY: 0 });
    };

    beforeEach(() => {
      Element.prototype.setPointerCapture = vi.fn();
      Element.prototype.releasePointerCapture = vi.fn();
    });
    afterEach(() => vi.unstubAllGlobals());

    it('deletes the item and offers Undo when swiped left on a touch screen', async () => {
      useCoarsePointer(true);
      const stored = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
      await renderSwipeable(stored);

      drag({ to: 120 });

      expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
      expect(await fakeShoppingList.listItems()).toEqual([]);
    });

    it('keeps the item when the swipe is short', async () => {
      useCoarsePointer(true);
      const stored = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
      await renderSwipeable(stored);

      drag({ to: 240 });

      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
      expect(await fakeShoppingList.listItems()).toHaveLength(1);
    });

    it('does not delete when the drag starts on the grip handle', async () => {
      useCoarsePointer(true);
      const stored = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
      const Wrapper = createShoppingListWrapper();
      render(
        <Wrapper>
          <Loaded />
          <ul>
            <ItemRow item={stored} shops={[EXPRESS]} handle={<button aria-label="grip" />} />
          </ul>
        </Wrapper>,
      );
      await screen.findByTestId('swipe-loaded');
      const grip = screen.getByRole('button', { name: 'grip' });

      fireEvent.pointerDown(grip, { pointerId: 1, clientX: 300, clientY: 0 });
      fireEvent.pointerMove(grip, { pointerId: 1, clientX: 100, clientY: 0 });
      fireEvent.pointerUp(grip, { pointerId: 1, clientX: 100, clientY: 0 });

      expect(await fakeShoppingList.listItems()).toHaveLength(1);
    });

    it('does nothing with a mouse', async () => {
      useCoarsePointer(false);
      const stored = await fakeShoppingList.addItem({ name: 'Milk', shopIds: [] });
      await renderSwipeable(stored);

      drag({ to: 0 });

      expect(await fakeShoppingList.listItems()).toHaveLength(1);
    });
  });
});
