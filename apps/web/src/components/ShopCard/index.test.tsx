import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop } from '../../services/shoppingList/types';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { ShopCard } from './index';

const TESCO: Shop = { id: 'b1', name: 'Tesco', color: ShopColor.Sky, order: 0 };
const SECTION = {
  shop: TESCO,
  items: [{ id: 'i1', name: 'Apples', shopIds: ['b1'], checked: false, createdAt: 0 }],
};

const renderCard = (draggable: boolean) => {
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <DndContext>
        <ShopCard section={SECTION} allShops={[TESCO]} draggable={draggable} quickAdd={false} />
      </DndContext>
    </Wrapper>,
  );
};

describe('ShopCard', () => {
  it('shows the shop and its items', () => {
    renderCard(false);

    expect(screen.getByRole('region', { name: 'Tesco' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Apples' })).toBeInTheDocument();
  });

  it('has no drag handles when dragging is off', () => {
    renderCard(false);

    expect(screen.queryByTestId('item-drag-handle')).not.toBeInTheDocument();
  });

  it('has a drag handle for each item when dragging is on', () => {
    renderCard(true);

    expect(screen.getByTestId('item-drag-handle')).toBeInTheDocument();
  });
});
