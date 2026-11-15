import { act, screen, waitFor } from '@testing-library/react';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import type { ListItem } from '../../../../services/shoppingList/types';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { DELETE_ACTION, INFO_ACTION } from '../../constants';
import { useItemRow } from './index';

const setup = async () => {
  const item: ListItem = await fakeShoppingList.addItem({
    name: 'Milk',
    shopIds: [],
  });
  const { result } = await renderHookWithHousehold(() => useItemRow({ item }));
  return { item, result };
};

const twoShops = async () => {
  const first = await fakeShoppingList.createShop({ name: 'Express', color: ShopColor.Mint });
  const second = await fakeShoppingList.createShop({ name: 'Market', color: ShopColor.Sky });
  return [first.id, second.id] as const;
};

const stored = async () => (await fakeShoppingList.listItems())[0];

describe('useItemRow', () => {
  beforeEach(() => window.localStorage.clear());

  it('ticks the item', async () => {
    const { result } = await setup();

    act(() => result.current.toggle(true));

    await waitFor(async () => expect((await stored())?.checked).toBe(true));
  });

  it('renames the item with a trimmed draft and leaves edit mode', async () => {
    const { result } = await setup();

    act(() => result.current.startEditing());
    act(() => result.current.setDraft('  Oat milk '));
    act(() => result.current.commit());

    expect(result.current.isEditing).toBe(false);
    await waitFor(async () => expect((await stored())?.name).toBe('Oat milk'));
  });

  it('does not save a blank or unchanged draft', async () => {
    const { result } = await setup();

    act(() => result.current.startEditing());
    act(() => result.current.setDraft('   '));
    act(() => result.current.commit());

    expect((await stored())?.name).toBe('Milk');
  });

  it('cancels editing without saving', async () => {
    const { result } = await setup();

    act(() => result.current.startEditing());
    act(() => result.current.setDraft('Nope'));
    act(() => result.current.cancel());

    expect(result.current.isEditing).toBe(false);
    expect((await stored())?.name).toBe('Milk');
  });

  it('puts the item in the chosen shops', async () => {
    const { result } = await setup();
    const [first, second] = await twoShops();

    act(() => result.current.setShops({ shopIds: [first, second] }));

    await waitFor(async () =>
      expect((await stored())?.shops.map(({ id }) => id)).toEqual([first, second]),
    );
  });

  it('can take the item out of every shop', async () => {
    const { result } = await setup();
    const [first] = await twoShops();
    act(() => result.current.setShops({ shopIds: [first] }));
    await waitFor(async () => expect((await stored())?.shops.map(({ id }) => id)).toEqual([first]));

    act(() => result.current.setShops({ shopIds: [] }));

    await waitFor(async () => expect((await stored())?.shops.map(({ id }) => id)).toEqual([]));
  });

  it('opens the item info from the menu', async () => {
    const { result } = await setup();

    act(() => result.current.handleMenuAction(INFO_ACTION));

    expect(result.current.infoDialog.isOpen).toBe(true);
  });

  it('deletes the item from the menu', async () => {
    const { result } = await setup();

    act(() => result.current.handleMenuAction(DELETE_ACTION));

    await waitFor(async () => expect(await stored()).toBeUndefined());
  });

  it('offers Undo after deleting from the menu', async () => {
    const { result } = await setup();

    act(() => result.current.handleMenuAction(DELETE_ACTION));

    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });
});
