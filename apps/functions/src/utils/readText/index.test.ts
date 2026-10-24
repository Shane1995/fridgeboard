import { readText } from './index.ts';

describe('readText', () => {
  it('trims and accepts text within the limit', () => {
    expect(readText({ value: '  Milk ', maxLength: 10 })).toBe('Milk');
  });

  it.each([['   '], [''], ['x'.repeat(11)], [5], [undefined]])('rejects %j', (value) => {
    expect(readText({ value, maxLength: 10 })).toBeUndefined();
  });
});
