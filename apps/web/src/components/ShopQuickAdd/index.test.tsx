import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  ITEM_FAILURE_COPY,
  ShopColor,
  UNSORTED_SHOP_ID,
} from '../../services/shoppingList/constants';
import type { Shop } from '../../services/shoppingList/types';
import { UNSORTED_SHOP } from '../../services/shoppingList/utils/groupItemsByShop';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { fakeShoppingList } from '../../testUtils/fakeShoppingList';
import { useActiveHousehold } from '../../hooks/useActiveHousehold';
import { SHOP_QUICK_ADD_COPY } from './constants';
import { ShopQuickAdd } from './index';

const TESCO: Shop = { id: 'b1', name: 'Tesco', color: ShopColor.Sky, order: 0 };

const HouseholdReady = () => (useActiveHousehold() ? <span>household ready</span> : null);

const renderQuickAdd = async ({ shop, failMethod }: { shop: Shop; failMethod?: string }) => {
  const Wrapper = createShoppingListWrapper(failMethod === undefined ? {} : { failMethod });
  render(
    <Wrapper>
      <HouseholdReady />
      <ShopQuickAdd shop={shop} />
    </Wrapper>,
  );
  await screen.findByText('household ready');
  fireEvent.click(
    screen.getByRole('button', {
      name:
        shop.id === UNSORTED_SHOP_ID
          ? SHOP_QUICK_ADD_COPY.triggerUnassigned
          : SHOP_QUICK_ADD_COPY.trigger(shop.name),
    }),
  );
};

const addByTyping = (value: string) => {
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input);
};

describe('ShopQuickAdd', () => {
  beforeEach(() => window.localStorage.clear());

  it('opens a focused input named for the shop', async () => {
    await renderQuickAdd({ shop: TESCO });

    const input = screen.getByRole('textbox', { name: SHOP_QUICK_ADD_COPY.inputLabel });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('placeholder', SHOP_QUICK_ADD_COPY.placeholder('Tesco'));
  });

  it('adds to that shop on Enter and stays open and clear for the next item', async () => {
    await renderQuickAdd({ shop: TESCO });
    const input = screen.getByRole('textbox', { name: SHOP_QUICK_ADD_COPY.inputLabel });

    addByTyping('Apples');

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    await waitFor(async () => {
      const items = await fakeShoppingList.listItems();
      expect(items.map(({ name, shopIds }) => ({ name, shopIds }))).toEqual([
        { name: 'Apples', shopIds: ['b1'] },
      ]);
    });
  });

  it('adds with no shop from the Unassigned card', async () => {
    await renderQuickAdd({ shop: UNSORTED_SHOP });

    addByTyping('Tape');

    await waitFor(async () => {
      const items = await fakeShoppingList.listItems();
      expect(items.map(({ name, shopIds }) => ({ name, shopIds }))).toEqual([
        { name: 'Tape', shopIds: [] },
      ]);
    });
  });

  it('adds nothing for blank input', async () => {
    await renderQuickAdd({ shop: TESCO });

    addByTyping('   ');

    expect(await fakeShoppingList.listItems()).toEqual([]);
  });

  it('closes on Escape', async () => {
    await renderQuickAdd({ shop: TESCO });

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: SHOP_QUICK_ADD_COPY.trigger('Tesco') }),
    ).toBeVisible();
  });

  it('tells the user when the item could not be added', async () => {
    await renderQuickAdd({ shop: TESCO, failMethod: 'POST' });

    addByTyping('Apples');

    expect(await screen.findByText(ITEM_FAILURE_COPY.add('Apples'))).toBeInTheDocument();
  });
});
