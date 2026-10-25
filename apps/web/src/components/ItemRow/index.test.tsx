import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop, ListItem } from '../../services/shoppingList/types';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { useItemsQuery } from '../../hooks/useItemsQuery';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { ITEM_ROW_COPY } from './constants';
import { ItemRow } from './index';

const ITEM: ListItem = {
  id: 'i1',
  name: 'Milk',
  shopIds: [],
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

    const renderStored = async (stored: ListItem, shops: Shop[]) => {
      const Wrapper = createShoppingListWrapper();
      render(
        <Wrapper>
          <LoadedMarker />
          <ul>
            <ItemRow item={stored} shops={shops} />
          </ul>
        </Wrapper>,
      );
      await screen.findByTestId('list-loaded');
      fireEvent.click(screen.getByRole('button', { name: ITEM_ROW_COPY.menu }));
      await screen.findByRole('menuitem', { name: ITEM_ROW_COPY.info });
    };

    it('offers Split by shop only for an item in two or more shops', async () => {
      await renderStored({ ...ITEM, shopIds: ['b1', 'b2'] }, [EXPRESS, MARKET]);

      expect(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.split })).toBeInTheDocument();
    });

    it('leaves Split out for an item in one shop', async () => {
      await renderStored({ ...ITEM, shopIds: ['b1'] }, [EXPRESS, MARKET]);

      expect(screen.queryByRole('menuitem', { name: ITEM_ROW_COPY.split })).not.toBeInTheDocument();
    });

    it('makes one item for each shop when Split by shop is chosen', async () => {
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

      choose(screen.getByRole('menuitem', { name: ITEM_ROW_COPY.split }));

      await waitFor(async () => expect(await fakeShoppingList.listItems()).toHaveLength(2));
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
});
