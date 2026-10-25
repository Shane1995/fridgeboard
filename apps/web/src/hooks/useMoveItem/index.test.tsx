import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop } from '../../services/shoppingList/types';
import { UNSORTED_SHOP } from '../../services/shoppingList/utils/groupItemsByShop';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { renderHookWithHousehold } from '../../testUtils/createShoppingListWrapper';
import { MOVE_ITEM_COPY } from './constants';
import { useMoveItem } from './index';

type Shops = { tesco: Shop; ms: Shop };

const setUp = async (shopIdsOf: (shops: Shops) => string[]) => {
  const tesco = await fakeShoppingList.createShop({ name: 'Tesco', color: ShopColor.Sky });
  const ms = await fakeShoppingList.createShop({ name: 'M&S', color: ShopColor.Mint });
  const apples = await fakeShoppingList.addItem({
    name: 'Apples',
    shopIds: shopIdsOf({ tesco, ms }),
  });
  const { result } = await renderHookWithHousehold(() => useMoveItem());
  return { tesco, ms, apples, result };
};

const shopsOf = async () => (await fakeShoppingList.listItems()).map(({ shopIds }) => shopIds);

describe('useMoveItem', () => {
  it('does nothing when an item is dropped where it already is', async () => {
    const { tesco, apples, result } = await setUp(({ tesco: t }) => [t.id]);

    await act(async () => result.current({ item: apples, from: tesco, to: tesco }));

    expect(await shopsOf()).toEqual([[tesco.id]]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('assigns an unassigned item to the shop and offers Undo', async () => {
    const { tesco, apples, result } = await setUp(() => []);

    await act(async () => result.current({ item: apples, from: UNSORTED_SHOP, to: tesco }));

    expect(await screen.findByText(MOVE_ITEM_COPY.assigned('Apples', 'Tesco'))).toBeInTheDocument();
    expect(await shopsOf()).toEqual([[tesco.id]]);
    fireEvent.click(screen.getByRole('button', { name: MOVE_ITEM_COPY.undo }));
    await waitFor(async () => expect(await shopsOf()).toEqual([[]]));
  });

  it('takes the item out of a shop when dropped on Unassigned', async () => {
    const { tesco, apples, result } = await setUp(({ tesco: t }) => [t.id]);

    await act(async () => result.current({ item: apples, from: tesco, to: UNSORTED_SHOP }));

    expect(
      await screen.findByText(MOVE_ITEM_COPY.unassigned('Apples', 'Tesco')),
    ).toBeInTheDocument();
    expect(await shopsOf()).toEqual([[]]);
  });

  it('says so when the item is already in the other shop', async () => {
    const { tesco, ms, apples, result } = await setUp(({ tesco: t, ms: m }) => [t.id, m.id]);

    await act(async () => result.current({ item: apples, from: tesco, to: ms }));

    expect(await screen.findByText(MOVE_ITEM_COPY.already('Apples', 'M&S'))).toBeInTheDocument();
    expect(await shopsOf()).toEqual([[tesco.id, ms.id]]);
  });

  describe('dragged from one shop to another', () => {
    const drag = async () => {
      const { tesco, ms, apples, result } = await setUp(({ tesco: t }) => [t.id]);
      await act(async () => result.current({ item: apples, from: tesco, to: ms }));
      await screen.findByText(MOVE_ITEM_COPY.askTitle('Apples', 'Tesco'));
      return { tesco, ms };
    };

    it('asks whether to move, add it here too, or copy it', async () => {
      const { ms } = await drag();

      expect(screen.getByRole('button', { name: MOVE_ITEM_COPY.move })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: MOVE_ITEM_COPY.alsoIn(ms.name) }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: MOVE_ITEM_COPY.copy })).toBeInTheDocument();
      expect(await shopsOf()).toHaveLength(1);
    });

    it('moves the item when Move is chosen', async () => {
      const { ms } = await drag();

      fireEvent.click(screen.getByRole('button', { name: MOVE_ITEM_COPY.move }));

      await waitFor(async () => expect(await shopsOf()).toEqual([[ms.id]]));
    });

    it('puts the same item in both shops when Also in is chosen', async () => {
      const { tesco, ms } = await drag();

      fireEvent.click(screen.getByRole('button', { name: MOVE_ITEM_COPY.alsoIn(ms.name) }));

      await waitFor(async () => expect(await shopsOf()).toEqual([[tesco.id, ms.id]]));
    });

    it('makes a separate item in the other shop when Copy is chosen', async () => {
      const { tesco, ms } = await drag();

      fireEvent.click(screen.getByRole('button', { name: MOVE_ITEM_COPY.copy }));

      await waitFor(async () => expect(await shopsOf()).toEqual([[tesco.id], [ms.id]]));
    });
  });
});
