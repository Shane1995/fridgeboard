import { render } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { SHOP_COLOR_CLASSES } from './constants';
import { ShopSwatch } from './index';

describe('ShopSwatch', () => {
  it.each(Object.values(ShopColor))('paints the %s magnet', (color) => {
    const { container } = render(<ShopSwatch color={color} />);

    expect(container.firstElementChild).toHaveClass(SHOP_COLOR_CLASSES[color]);
  });
});
