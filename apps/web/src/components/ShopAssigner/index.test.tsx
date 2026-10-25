import { fireEvent, render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop } from '../../services/shoppingList/types';
import { SHOP_ASSIGNER_COPY } from './constants';
import { ShopAssigner } from './index';

const SHOPS: Shop[] = [
  { id: 'b1', name: 'Express run', color: ShopColor.Mint, order: 1 },
  { id: 'b2', name: 'Sainsburys', color: ShopColor.Tomato, order: 2 },
  { id: 'b3', name: 'Market', color: ShopColor.Sky, order: 3 },
];

const choose = (item: HTMLElement) => {
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
};

const open = () => fireEvent.click(screen.getByRole('button', { name: /^Assign to shops/ }));

describe('ShopAssigner', () => {
  it('invites the user to assign shops when none are picked', () => {
    render(<ShopAssigner shops={SHOPS} selectedIds={[]} onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: SHOP_ASSIGNER_COPY.assign });
    expect(trigger).toHaveTextContent(SHOP_ASSIGNER_COPY.assign);
  });

  it('shows the shop name when one is picked', () => {
    render(<ShopAssigner shops={SHOPS} selectedIds={['b1']} onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', {
      name: `${SHOP_ASSIGNER_COPY.assign}: Express run`,
    });
    expect(trigger).toHaveTextContent('Express run');
  });

  it('shows how many shops are picked, and names them for screen readers', () => {
    render(<ShopAssigner shops={SHOPS} selectedIds={['b1', 'b2']} onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', {
      name: `${SHOP_ASSIGNER_COPY.assign}: Express run, Sainsburys`,
    });
    expect(trigger).toHaveTextContent(SHOP_ASSIGNER_COPY.count(2));
  });

  it('ignores a picked id that is not a shop any more', () => {
    render(<ShopAssigner shops={SHOPS} selectedIds={['gone']} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: SHOP_ASSIGNER_COPY.assign })).toBeInTheDocument();
  });

  it('lists every shop with the picked ones ticked', async () => {
    render(<ShopAssigner shops={SHOPS} selectedIds={['b2']} onChange={vi.fn()} />);

    open();

    expect(await screen.findAllByRole('menuitemcheckbox')).toHaveLength(3);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sainsburys' })).toBeChecked();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Market' })).not.toBeChecked();
  });

  it('reports the shop added to the picked ones', async () => {
    const onChange = vi.fn();
    render(<ShopAssigner shops={SHOPS} selectedIds={['b1']} onChange={onChange} />);

    open();
    choose(await screen.findByRole('menuitemcheckbox', { name: 'Market' }));

    expect(onChange).toHaveBeenCalledWith(['b1', 'b3']);
  });

  it('reports the shop taken away from the picked ones', async () => {
    const onChange = vi.fn();
    render(<ShopAssigner shops={SHOPS} selectedIds={['b1', 'b3']} onChange={onChange} />);

    open();
    choose(await screen.findByRole('menuitemcheckbox', { name: 'Express run' }));

    expect(onChange).toHaveBeenCalledWith(['b3']);
  });

  it('says there are no shops yet instead of an empty menu', async () => {
    render(<ShopAssigner shops={[]} selectedIds={[]} onChange={vi.fn()} />);

    open();

    const hint = await screen.findByRole('menuitemcheckbox', { name: SHOP_ASSIGNER_COPY.noShops });
    expect(hint).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByRole('menuitemcheckbox')).toHaveLength(1);
  });
});
