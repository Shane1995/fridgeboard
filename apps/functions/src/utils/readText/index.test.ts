import { readText } from './index.ts';

describe('readText', () => {
  it('trims and accepts text within the limit', () => {
    expect(readText('  Milk ', 10)).toBe('Milk');
  });

  it.each([['   '], [''], ['x'.repeat(11)], [5], [undefined]])('rejects %j', (value) => {
    expect(readText(value, 10)).toBeUndefined();
  });
});
