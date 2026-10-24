import { suggestFrom } from './index';

const history = [
  { name: 'Oat milk', shopIds: ['a'], count: 5 },
  { name: 'Milk', shopIds: ['a'], count: 2 },
  { name: 'Almond milk', shopIds: ['b'], count: 9 },
  { name: 'Bread', shopIds: ['a'], count: 7 },
];

describe('suggestFrom', () => {
  it('matches anywhere in the name, names starting with the text first, then most used', () => {
    expect(suggestFrom({ history, query: 'milk', onList: [] }).map(({ name }) => name)).toEqual([
      'Milk',
      'Almond milk',
      'Oat milk',
    ]);
  });

  it('leaves out names already on the list, ignoring case', () => {
    expect(
      suggestFrom({ history, query: 'milk', onList: ['MILK'] }).map(({ name }) => name),
    ).toEqual(['Almond milk', 'Oat milk']);
  });

  it('returns nothing for an empty query', () => {
    expect(suggestFrom({ history, query: '  ', onList: [] })).toEqual([]);
  });

  it('caps the number of suggestions', () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      name: `Milk ${index}`,
      shopIds: ['a'],
      count: index,
    }));

    expect(suggestFrom({ history: many, query: 'milk', onList: [] })).toHaveLength(5);
  });
});
