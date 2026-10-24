import { fireEvent, render, screen } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop } from '../../services/shoppingList/types';
import { SHOP_PICKER_COPY } from './constants';
import { ShopPicker } from './index';

const SHOPS: Shop[] = [
  { id: 'general', name: 'General', color: ShopColor.Slate, order: 0 },
  { id: 'b1', name: 'Express run', color: ShopColor.Mint, order: 1 },
];

const choose = (item: HTMLElement) => {
  fireEvent.keyDown(item, { key: 'Enter' });
  fireEvent.keyUp(item, { key: 'Enter' });
};

describe('ShopPicker', () => {
  it('shows the selected shop on the trigger', () => {
    render(<ShopPicker shops={SHOPS} shopId="b1" onChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: `${SHOP_PICKER_COPY.label}: Express run` }),
    ).toBeInTheDocument();
  });

  it('lists every shop and reports the one chosen', async () => {
    const onChange = vi.fn();
    render(<ShopPicker shops={SHOPS} shopId="b1" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Shop:/ }));
    const general = await screen.findByRole('menuitemradio', { name: 'General' });
    expect(screen.getByRole('menuitemradio', { name: 'Express run' })).toBeChecked();
    choose(general);

    expect(onChange).toHaveBeenCalledWith('general');
  });
});
