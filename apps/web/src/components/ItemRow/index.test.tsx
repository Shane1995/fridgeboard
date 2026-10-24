import { fireEvent, render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop, ListItem } from '../../services/shoppingList/types';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
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
});
