import { render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { ShopSectionData } from '../../services/shoppingList/types';
import { SHOP_COLOR_CLASSES } from '../ShopSwatch/constants';
import { ShopDragPreview } from './index';

const SECTION: ShopSectionData = {
  shop: { id: 'b1', name: 'Tesco', color: ShopColor.Sky, order: 0 },
  items: [
    { id: 'i1', name: 'Apples', shopIds: ['b1'], checked: false, createdAt: 0 },
    { id: 'i2', name: 'Pears', shopIds: ['b1'], checked: false, createdAt: 0 },
  ],
};

describe('ShopDragPreview', () => {
  it('shows the shop name on its colour', () => {
    render(<ShopDragPreview section={SECTION} />);

    expect(screen.getByText('Tesco')).toHaveClass(SHOP_COLOR_CLASSES[ShopColor.Sky]);
  });

  it('counts the items in the shop', () => {
    render(<ShopDragPreview section={SECTION} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('offers nothing to press, since it only follows the pointer', () => {
    render(<ShopDragPreview section={SECTION} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
