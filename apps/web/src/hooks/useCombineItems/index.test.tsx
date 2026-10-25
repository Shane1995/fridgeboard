import { act, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderHookWithHousehold } from '../../testUtils/createShoppingListWrapper';
import { COMBINE_ITEMS_COPY } from './constants';
import { useCombineItems } from './index';

const seed = async () => {
  const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
  const ms = await fakeShoppingList.createShop({ name: 'M&S', color: ShopColor.Mint });
  const market = await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Tomato });
  return { tesco, ms, market };
};

const remaining = async () =>
  (await fakeShoppingList.listItems()).map(({ name, shopIds }) => ({ name, shopIds }));

describe('useCombineItems', () => {
  it('keeps one item in all the shops of the items combined, and removes the others', async () => {
    const { tesco, ms, market } = await seed();
    const keeper = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id] });
    const second = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [ms.id] });
    const third = await fakeShoppingList.addItem({
      name: 'apples',
      shopIds: [ms.id, market.id],
    });
    const { result } = await renderHookWithHousehold(() => useCombineItems());

    await act(async () => result.current({ keeper, duplicates: [second, third] }));

    await waitFor(async () =>
      expect(await remaining()).toEqual([
        { name: 'Apples', shopIds: [tesco.id, ms.id, market.id] },
      ]),
    );
  });

  it('says how many items became one', async () => {
    const { tesco, ms } = await seed();
    const keeper = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id] });
    const other = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [ms.id] });
    const { result } = await renderHookWithHousehold(() => useCombineItems());

    await act(async () => result.current({ keeper, duplicates: [other] }));

    expect(await screen.findByText(COMBINE_ITEMS_COPY.done('Apples', 2))).toBeInTheDocument();
  });

  it('removes nothing when the kept item cannot be updated', async () => {
    const { tesco, ms } = await seed();
    const keeper = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [tesco.id] });
    const other = await fakeShoppingList.addItem({ name: 'Apples', shopIds: [ms.id] });
    const { result } = await renderHookWithHousehold(() => useCombineItems(), {
      failMethod: 'PATCH',
    });

    await act(async () => result.current({ keeper, duplicates: [other] }));

    expect(await remaining()).toHaveLength(2);
  });
});
