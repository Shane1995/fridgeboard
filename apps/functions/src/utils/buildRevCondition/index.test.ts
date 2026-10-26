import { buildRevCondition } from './index.ts';

describe('buildRevCondition', () => {
  it('requires an existing household with no rev for the first change', () => {
    expect(buildRevCondition({ current: 0 })).toEqual({
      expression: 'attribute_exists(PK) AND attribute_not_exists(#rev)',
      names: { '#rev': 'rev' },
    });
  });

  it('requires the rev to still be the one that was read', () => {
    expect(buildRevCondition({ current: 7 })).toEqual({
      expression: '#rev = :current',
      names: { '#rev': 'rev' },
      values: { ':current': 7 },
    });
  });
});
