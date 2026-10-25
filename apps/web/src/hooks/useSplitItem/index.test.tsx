import { act, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { ListItem } from '../../services/shoppingList/types';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderHookWithHousehold } from '../../testUtils/createShoppingListWrapper';
import { SPLIT_ITEM_COPY } from './constants';
import { useSplitItem } from './index';

const seed = async () => {
  const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
  const ms = await fakeShoppingList.createShop({ name: 'M&S', color: ShopColor.Mint });
  const market = await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Tomato });
  return { tesco, ms, market };
};

const namesAndShops = async () =>
  (await fakeShoppingList.listItems()).map(({ name, shopIds, checked }) => ({
    name,
    shopIds,
    checked,
  }));

describe('useSplitItem', () => {
  it('turns an item in several shops into one item for each shop', async () => {
    const { tesco, ms, market } = await seed();
    const apples = await fakeShoppingList.addItem({
      name: 'Apples',
      shopIds: [tesco.id, ms.id, market.id],
    });
    const { result } = await renderHookWithHousehold(() => useSplitItem());

    await act(async () => result.current(apples));

    await waitFor(async () =>
      expect(await namesAndShops()).toEqual([
        { name: 'Apples', shopIds: [tesco.id], checked: false },
        { name: 'Apples', shopIds: [ms.id], checked: false },
        { name: 'Apples', shopIds: [market.id], checked: false },
      ]),
    );
  });

  it('says how many items there are now', async () => {
    const { tesco, ms } = await seed();
    const apples = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id, ms.id] });
    const { result } = await renderHookWithHousehold(() => useSplitItem());

    await act(async () => result.current(apples));

    expect(await screen.findByText(SPLIT_ITEM_COPY.done('Apples', 2))).toBeInTheDocument();
  });

  it('does nothing for an item that is in one shop or none', async () => {
    const { tesco } = await seed();
    const one = await fakeShoppingList.addItem({ name: 'Eggs', shopIds: [tesco.id] });
    const none = await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });
    const { result } = await renderHookWithHousehold(() => useSplitItem());

    await act(async () => {
      await result.current(one);
      await result.current(none);
    });

    expect(await namesAndShops()).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('leaves the original untouched when a new item cannot be added', async () => {
    const { tesco, ms } = await seed();
    const apples: ListItem = await fakeShoppingList.addItem({
      name: 'Apples',
      shopIds: [tesco.id, ms.id],
    });
    const { result } = await renderHookWithHousehold(() => useSplitItem(), { failMethod: 'POST' });

    await act(async () => result.current(apples));

    expect(await namesAndShops()).toEqual([
      { name: 'Apples', shopIds: [tesco.id, ms.id], checked: false },
    ]);
  });
});
