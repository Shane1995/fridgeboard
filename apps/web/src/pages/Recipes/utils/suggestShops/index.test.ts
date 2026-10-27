import { suggestShops } from '.';

const ingredient = (id: string, item: string) => ({ id, quantity: 1, unit: '', item });

describe('suggestShops', () => {
  const result = suggestShops({
    ingredients: [
      ingredient('a', 'onions'),
      ingredient('b', 'beef mince'),
      ingredient('c', 'olive oil'),
      ingredient('d', 'saffron'),
    ],
  });

  it('suggests fresh veg from the Express and tins and meat from the order', () => {
    expect(result.a?.shopId).toBe('express');
    expect(result.b?.shopId).toBe('sainsburys');
  });

  it('offers up to two other shops as alternatives, never the suggestion or Unassigned', () => {
    expect(result.a?.alternativeShopIds).toEqual(['sainsburys', 'market']);
    expect(result.b?.alternativeShopIds).toEqual(['express', 'market']);
  });

  it('flags pantry staples', () => {
    expect(result.c?.isStaple).toBe(true);
    expect(result.a?.isStaple).toBe(false);
  });

  it('falls back to Unassigned for something it does not know', () => {
    expect(result.d?.shopId).toBe('unsorted');
  });
});
