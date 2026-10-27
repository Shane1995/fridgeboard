import { formatIngredient } from '.';

describe('formatIngredient', () => {
  it('joins quantity, unit and item', () => {
    expect(formatIngredient({ ingredient: { quantity: 500, unit: 'g', item: 'beef mince' } })).toBe(
      '500 g beef mince',
    );
  });

  it('skips a missing quantity or unit', () => {
    expect(formatIngredient({ ingredient: { quantity: undefined, unit: '', item: 'salt' } })).toBe(
      'salt',
    );
    expect(formatIngredient({ ingredient: { quantity: 2, unit: '', item: 'onions' } })).toBe(
      '2 onions',
    );
  });

  it('scales the quantity and trims the decimals', () => {
    expect(
      formatIngredient({ ingredient: { quantity: 1, unit: 'tsp', item: 'cumin' }, factor: 1.5 }),
    ).toBe('1.5 tsp cumin');
    expect(
      formatIngredient({ ingredient: { quantity: 1, unit: 'g', item: 'x' }, factor: 1 / 3 }),
    ).toBe('0.33 g x');
  });
});
