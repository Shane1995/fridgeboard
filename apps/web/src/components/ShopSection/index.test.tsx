import { DndContext } from '@dnd-kit/core';
import { render, screen, within } from '@testing-library/react';
import { ShopColor, UNSORTED_SHOP_ID } from '../../services/shoppingList/constants';
import type { ListItem, Shop } from '../../services/shoppingList/types';
import { UNSORTED_SHOP } from '../../services/shoppingList/utils/groupItemsByShop';
import { createShoppingListWrapper } from '../../testUtils/createShoppingListWrapper';
import { SHOP_SECTION_COPY } from './constants';
import { ShopSection } from './index';

const TESCO: Shop = { id: 'b1', name: 'Tesco', color: ShopColor.Sky, order: 0 };
const ALDI: Shop = { id: 'b2', name: 'Aldi', color: ShopColor.Pink, order: 1 };
const item = (id: string, name: string, shopIds: string[]): ListItem => ({
  id,
  name,
  shopIds,
  checked: false,
  createdAt: 0,
});

const renderSection = ({
  shop,
  items,
  draggable,
}: {
  shop: Shop;
  items: ListItem[];
  draggable?: boolean;
}) => {
  const Wrapper = createShoppingListWrapper();
  render(
    <Wrapper>
      <DndContext>
        <ShopSection
          section={{ shop, items }}
          allShops={[UNSORTED_SHOP, TESCO, ALDI]}
          {...(draggable === undefined ? {} : { draggable })}
        />
      </DndContext>
    </Wrapper>,
  );
};

describe('ShopSection', () => {
  it('names the shop and counts its items in the header', () => {
    renderSection({ shop: TESCO, items: [item('i1', 'Apples', ['b1'])] });

    const card = screen.getByRole('region', { name: 'Tesco' });
    expect(within(card).getByRole('heading', { name: 'Tesco' })).toBeInTheDocument();
    expect(within(card).getByText('1')).toBeInTheDocument();
  });

  it('can be edited, except the Unassigned card', () => {
    renderSection({ shop: TESCO, items: [] });
    expect(
      screen.getByRole('button', { name: `${SHOP_SECTION_COPY.edit}: Tesco` }),
    ).toBeInTheDocument();
  });

  it('has no header or edit button for the Unassigned card', () => {
    renderSection({ shop: UNSORTED_SHOP, items: [item('i1', 'Tape', [])] });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument();
    expect(UNSORTED_SHOP.id).toBe(UNSORTED_SHOP_ID);
  });

  it('shows the quick add row only when asked', () => {
    const Wrapper = createShoppingListWrapper();
    const { rerender } = render(
      <Wrapper>
        <DndContext>
          <ShopSection section={{ shop: TESCO, items: [] }} allShops={[TESCO]} quickAdd />
        </DndContext>
      </Wrapper>,
    );
    expect(screen.getByRole('button', { name: 'Add to Tesco' })).toBeInTheDocument();

    rerender(
      <Wrapper>
        <DndContext>
          <ShopSection section={{ shop: TESCO, items: [] }} allShops={[TESCO]} />
        </DndContext>
      </Wrapper>,
    );
    expect(screen.queryByRole('button', { name: 'Add to Tesco' })).not.toBeInTheDocument();
  });

  it('says so when the shop has no items', () => {
    renderSection({ shop: TESCO, items: [] });

    expect(screen.getByText(SHOP_SECTION_COPY.empty)).toBeInTheDocument();
  });

  it('shows where else an item can be got, on the card it is listed under', () => {
    renderSection({ shop: TESCO, items: [item('i1', 'Apples', ['b1', 'b2'])] });

    expect(screen.getByRole('img', { name: 'Also in Aldi' })).toBeInTheDocument();
  });

  it('has no drag handles unless dragging is switched on', () => {
    renderSection({ shop: TESCO, items: [item('i1', 'Apples', ['b1'])] });

    expect(screen.queryByTestId('item-drag-handle')).not.toBeInTheDocument();
  });

  it('gives every item a drag handle when dragging is switched on', () => {
    renderSection({
      shop: TESCO,
      items: [item('i1', 'Apples', ['b1']), item('i2', 'Pears', ['b1'])],
      draggable: true,
    });

    expect(screen.getAllByTestId('item-drag-handle')).toHaveLength(2);
  });
});
