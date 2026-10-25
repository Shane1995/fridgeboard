import { SHOP_COLORS } from '@fridgeboard/contract/lists/constants';
import { readColor } from './index.ts';

describe('readColor', () => {
  it.each(SHOP_COLORS)('accepts %s', (color) => {
    expect(readColor(color)).toBe(color);
  });

  it('accepts the branded colours', () => {
    expect(['black', 'forest', 'lime', 'orange', 'navy', 'cyan', 'yellow'].map(readColor)).toEqual([
      'black',
      'forest',
      'lime',
      'orange',
      'navy',
      'cyan',
      'yellow',
    ]);
  });

  it.each([['purple-ish'], [''], [7], [undefined], [null]])('refuses %j', (value) => {
    expect(readColor(value)).toBeUndefined();
  });
});
