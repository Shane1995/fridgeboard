import { act, waitFor } from '@testing-library/react';
import { UNSORTED_SHOP_ID } from '../../../../services/shoppingList/constants';
import { fakeShoppingList } from '../../../../testUtils/fakeShoppingList';
import type { ListItem } from '../../../../services/shoppingList/types';
import { renderHookWithHousehold } from '../../../../testUtils/createShoppingListWrapper';
import { DELETE_ACTION, INFO_ACTION, MOVE_ACTION_PREFIX } from '../../constants';
import { useItemRow } from './index';

const setup = async () => {
  const item: ListItem = await fakeShoppingList.addItem({
    name: 'Milk',
    shopId: UNSORTED_SHOP_ID,
  });
  const { result } = await renderHookWithHousehold(() => useItemRow(item));
  return { item, result };
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

  it('moves the item to another shop from the menu', async () => {
    const { result } = await setup();

    act(() => result.current.handleMenuAction(`${MOVE_ACTION_PREFIX}b1`));

    await waitFor(async () => expect((await stored())?.shopId).toBe('b1'));
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
});
