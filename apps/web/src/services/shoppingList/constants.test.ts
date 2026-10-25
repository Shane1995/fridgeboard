import { SHOP_COLORS } from '@fridgeboard/contract/lists/constants';
import { SHOP_COLOR_CLASSES, SHOP_TEXT_CLASSES } from '../../components/ShopSwatch/constants';
import { ShopColor } from './constants';

describe('shop colours', () => {
  it('offers exactly the colours the API accepts', () => {
    expect([...Object.values(ShopColor)].sort()).toEqual([...SHOP_COLORS].sort());
  });

  it('has a branded set to choose from, as well as the originals', () => {
    expect(Object.values(ShopColor)).toEqual(
      expect.arrayContaining([
        'black',
        'forest',
        'lime',
        'orange',
        'navy',
        'cyan',
        'yellow',
        'tomato',
        'slate',
      ]),
    );
  });

  it.each(Object.values(ShopColor))(
    'paints %s with a background and a readable text colour',
    (color) => {
      expect(SHOP_COLOR_CLASSES[color]).toMatch(/^bg-\[#[0-9a-f]{6}\]$/);
      expect(SHOP_TEXT_CLASSES[color]).toMatch(/^text-(white|foreground)$/);
    },
  );

  it('gives every colour its own background', () => {
    const backgrounds = Object.values(ShopColor).map((color) => SHOP_COLOR_CLASSES[color]);

    expect(new Set(backgrounds).size).toBe(backgrounds.length);
  });
});
