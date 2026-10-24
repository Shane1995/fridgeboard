import { ShopColor } from '../../constants';
import { toShop } from './index';

describe('toShop', () => {
  it('keeps the fields and turns the colour name into the colour', () => {
    expect(toShop({ id: 'b1', name: 'Aldi', color: 'sky', order: 2 })).toEqual({
      id: 'b1',
      name: 'Aldi',
      color: ShopColor.Sky,
      order: 2,
    });
  });

  it('falls back to slate for a colour this build does not know', () => {
    expect(toShop({ id: 'b1', name: 'Aldi', color: 'beige' as never, order: 0 }).color).toBe(
      ShopColor.Slate,
    );
  });
});
