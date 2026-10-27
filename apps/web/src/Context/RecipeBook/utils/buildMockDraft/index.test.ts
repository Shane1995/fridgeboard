import { buildMockDraft } from '.';

describe('buildMockDraft', () => {
  it('turns a link into a titled draft that keeps the link', () => {
    const draft = buildMockDraft({ source: 'https://example.com/recipes/creamy-garlic-pasta' });
    expect(draft?.name).toBe('Creamy Garlic Pasta');
    expect(draft?.sourceUrl).toBe('https://example.com/recipes/creamy-garlic-pasta');
    expect(draft?.ingredients.length).toBeGreaterThan(0);
  });

  it('names a link without a path', () => {
    expect(buildMockDraft({ source: 'https://example.com' })?.name).toBe('Imported recipe');
  });

  it('fails for a link that cannot be read', () => {
    expect(buildMockDraft({ source: 'https://example.com/fail' })).toBeUndefined();
  });

  it('reads pasted text as one ingredient per line', () => {
    const draft = buildMockDraft({ source: '2 eggs\n\n  100 g flour  ' });
    expect(draft?.name).toBe('Pasted recipe');
    expect(draft?.ingredients.map((ingredient) => ingredient.item)).toEqual([
      '2 eggs',
      '100 g flour',
    ]);
  });

  it('fails for empty text', () => {
    expect(buildMockDraft({ source: '  \n ' })).toBeUndefined();
  });
});
