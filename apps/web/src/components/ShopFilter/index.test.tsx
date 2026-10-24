import { fireEvent, render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { ShopSectionData } from '../../services/shoppingList/types';
import { SHOP_FILTER_COPY } from './constants';
import { ShopFilter } from './index';

const item = (id: string) => ({ id, name: id, shopIds: ['b1'], checked: false, createdAt: 0 });
const SECTIONS: ShopSectionData[] = [
  {
    shop: { id: 'b1', name: 'Express', color: ShopColor.Mint, order: 0 },
    items: [item('a'), item('b')],
  },
  {
    shop: { id: 'b2', name: 'Market', color: ShopColor.Mustard, order: 1 },
    items: [item('c')],
  },
];

describe('ShopFilter', () => {
  it('offers All with the total and each shop with its count', () => {
    render(<ShopFilter sections={SECTIONS} focusedId={undefined} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: `${SHOP_FILTER_COPY.all}, 3` })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Express, 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Market, 1' })).toBeInTheDocument();
  });

  it('marks the focused shop as pressed', () => {
    render(<ShopFilter sections={SECTIONS} focusedId="b2" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Market, 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: `${SHOP_FILTER_COPY.all}, 3` })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('selects a shop, and All clears the selection', () => {
    const onSelect = vi.fn();
    render(<ShopFilter sections={SECTIONS} focusedId="b1" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Market, 1' }));
    fireEvent.click(screen.getByRole('button', { name: `${SHOP_FILTER_COPY.all}, 3` }));

    expect(onSelect).toHaveBeenNthCalledWith(1, 'b2');
    expect(onSelect).toHaveBeenNthCalledWith(2, undefined);
  });
});
