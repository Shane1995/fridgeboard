import { render } from '@testing-library/react';
import { ShopColor } from '../../services/shoppingList/constants';
import { SHOP_COLOR_CLASSES, SHOP_TEXT_CLASSES } from './constants';
import { ShopSwatch } from './index';

describe('ShopSwatch', () => {
  it.each(Object.values(ShopColor))('paints the %s magnet', (color) => {
    const { container } = render(<ShopSwatch color={color} />);

    expect(container.firstElementChild).toHaveClass(SHOP_COLOR_CLASSES[color]);
  });

  it('is a plain dot when there is no name', () => {
    const { container } = render(<ShopSwatch color={ShopColor.Mint} />);

    expect(container).toHaveTextContent('');
  });

  it('shows the first letter of the shop, in capitals, on its colour', () => {
    const { container } = render(<ShopSwatch color={ShopColor.Sky} name="  sainsbury's" />);

    expect(container).toHaveTextContent('S');
    expect(container.firstElementChild).toHaveClass(
      SHOP_COLOR_CLASSES[ShopColor.Sky],
      SHOP_TEXT_CLASSES[ShopColor.Sky],
    );
  });

  it('keeps the letter readable on the light colours', () => {
    const { container } = render(<ShopSwatch color={ShopColor.Mustard} name="Tesco" />);

    expect(container.firstElementChild).toHaveClass(SHOP_TEXT_CLASSES[ShopColor.Mustard]);
  });

  it('shows a whole letter for a name that starts with an emoji', () => {
    const { container } = render(<ShopSwatch color={ShopColor.Pink} name="🍎 Market" />);

    expect(container).toHaveTextContent('🍎');
  });

  it('is hidden from assistive technology, since the shop name is read elsewhere', () => {
    const { container } = render(<ShopSwatch color={ShopColor.Grape} name="Aldi" />);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
