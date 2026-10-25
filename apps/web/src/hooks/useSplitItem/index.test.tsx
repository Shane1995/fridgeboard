import { act, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderHookWithHousehold } from '../../testUtils/createShoppingListWrapper';
import { SPLIT_ITEM_COPY } from './constants';
import { useSplitItem } from './index';

const NAMES = ['Tesco', 'M&S', 'Market'];

const setUp = async ({ inShops, failMethod }: { inShops: number; failMethod?: string }) => {
  const ids: string[] = [];
  for (const name of NAMES) {
    ids.push((await fakeShoppingList.createShop({ name, color: ShopColor.Sky })).id);
  }
  const apples = await fakeShoppingList.addItem({
    name: 'Apples',
    shopIds: ids.slice(0, inShops),
  });
  const { result } = await renderHookWithHousehold(
    () => useSplitItem(),
    failMethod === undefined ? {} : { failMethod },
  );
  return { ids, apples, result };
};

const namesAndShops = async () =>
  (await fakeShoppingList.listItems()).map(({ name, shopIds, checked }) => ({
    name,
    shopIds,
    checked,
  }));

describe('useSplitItem', () => {
  it('turns an item in several shops into one item for each shop', async () => {
    const { ids, apples, result } = await setUp({ inShops: 3 });

    await act(async () => result.current(apples));

    await waitFor(async () =>
      expect(await namesAndShops()).toEqual(
        ids.map((id) => ({ name: 'Apples', shopIds: [id], checked: false })),
      ),
    );
  });

  it('says how many items there are now', async () => {
    const { apples, result } = await setUp({ inShops: 2 });

    await act(async () => result.current(apples));

    expect(await screen.findByText(SPLIT_ITEM_COPY.done('Apples', 2))).toBeInTheDocument();
  });

  it('does nothing for an item that is in one shop or none', async () => {
    const { apples, result } = await setUp({ inShops: 1 });
    const none = await fakeShoppingList.addItem({ name: 'Tape', shopIds: [] });

    await act(async () => {
      await result.current(apples);
      await result.current(none);
    });

    expect(await namesAndShops()).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('leaves the original untouched when a new item cannot be added', async () => {
    const { ids, apples, result } = await setUp({ inShops: 2, failMethod: 'POST' });

    await act(async () => result.current(apples));

    expect(await namesAndShops()).toEqual([
      { name: 'Apples', shopIds: ids.slice(0, 2), checked: false },
    ]);
  });
});
