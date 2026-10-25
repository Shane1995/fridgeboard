import { render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { ListItem, Shop } from '../../services/shoppingList/types';
import { ItemDragPreview } from './index';

const SHOPS: Shop[] = [
  { id: 'b1', name: 'Tesco', color: ShopColor.Sky, order: 0 },
  { id: 'b2', name: 'Aldi', color: ShopColor.Pink, order: 1 },
];
const ITEM: ListItem = { id: 'i1', name: 'Apples', shopIds: ['b1'], checked: false, createdAt: 0 };

describe('ItemDragPreview', () => {
  it('shows the name of the item being dragged', () => {
    render(<ItemDragPreview item={ITEM} shops={SHOPS} />);

    expect(screen.getByText('Apples')).toBeInTheDocument();
  });

  it('shows a badge for each shop the item is in, and none for others', () => {
    const { container } = render(<ItemDragPreview item={ITEM} shops={SHOPS} />);

    const badges = container.querySelectorAll('[aria-hidden]');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('T');
  });
});
