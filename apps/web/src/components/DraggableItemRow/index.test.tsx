import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { ListItem, Shop } from '../../services/shoppingList/types';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { DraggableItemRow } from './index';

const TESCO: Shop = { id: 'b1', name: 'Tesco', color: ShopColor.Sky, order: 0 };
const ITEM: ListItem = { id: 'i1', name: 'Apples', shopIds: ['b1'], checked: false, createdAt: 0 };

const renderRow = () => {
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <DndContext>
        <ul>
          <DraggableItemRow item={ITEM} shops={[TESCO]} shopId="b1" />
        </ul>
      </DndContext>
    </Wrapper>,
  );
};

describe('DraggableItemRow', () => {
  it('shows the item as a normal row', () => {
    renderRow();

    expect(screen.getByRole('checkbox', { name: 'Apples' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item options' })).toBeInTheDocument();
  });

  it('adds a grip handle for pointers', () => {
    renderRow();

    expect(screen.getByTestId('item-drag-handle')).toBeInTheDocument();
  });

  it('keeps the handle out of the keyboard and screen reader flow, since the menu does the same job', () => {
    renderRow();

    const handle = screen.getByTestId('item-drag-handle');
    expect(handle).toHaveAttribute('aria-hidden', 'true');
    expect(handle).toHaveAttribute('tabindex', '-1');
  });
});
