import { kebabCase } from './index.ts';

describe('kebabCase', () => {
  it.each([
    ['me', 'me'],
    ['listItems', 'list-items'],
    ['preSignUp', 'pre-sign-up'],
    ['fn2Start', 'fn2-start'],
  ])('turns %s into %s', (input, expected) => {
    expect(kebabCase(input)).toBe(expected);
  });
});
