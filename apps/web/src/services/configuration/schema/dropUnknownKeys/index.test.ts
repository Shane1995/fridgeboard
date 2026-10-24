import { dropUnknownKeys } from './index';

describe('dropUnknownKeys', () => {
  it('keeps only the allowed keys', () => {
    expect(dropUnknownKeys({ value: { a: 1, b: 2, c: 3 }, allowed: ['a', 'c'] })).toEqual({
      a: 1,
      c: 3,
    });
  });

  it.each([[null], ['text'], [5], [[1, 2]]])('hands %j back untouched', (value) => {
    expect(dropUnknownKeys({ value, allowed: ['a'] })).toEqual(value);
  });
});
