import { buildRecipeDraft } from '.';

const form = {
  name: '  Pancakes ',
  servings: '3',
  sourceUrl: ' https://example.com/p ',
  photoUrl: '',
  ingredients: [
    { id: 'i1', quantity: '2', unit: ' cups ', item: ' flour ' },
    { id: 'i2', quantity: '', unit: '', item: 'salt' },
    { id: 'i3', quantity: '5', unit: 'g', item: '  ' },
  ],
  steps: [
    { id: 's1', text: ' Mix ' },
    { id: 's2', text: '   ' },
  ],
  notes: ' tasty ',
  tags: ['quick'],
};

describe('buildRecipeDraft', () => {
  it('trims text and drops empty ingredients and steps', () => {
    const draft = buildRecipeDraft({ form });
    expect(draft.name).toBe('Pancakes');
    expect(draft.sourceUrl).toBe('https://example.com/p');
    expect(draft.notes).toBe('tasty');
    expect(draft.ingredients).toEqual([
      { id: 'i1', quantity: 2, unit: 'cups', item: 'flour' },
      { id: 'i2', quantity: undefined, unit: '', item: 'salt' },
    ]);
    expect(draft.steps).toEqual(['Mix']);
  });

  it('falls back to the default servings for a bad number', () => {
    expect(buildRecipeDraft({ form: { ...form, servings: 'abc' } }).servings).toBe(4);
    expect(buildRecipeDraft({ form: { ...form, servings: '0' } }).servings).toBe(4);
    expect(buildRecipeDraft({ form }).servings).toBe(3);
  });
});
