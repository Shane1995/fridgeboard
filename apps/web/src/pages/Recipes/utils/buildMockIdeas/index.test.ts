import { buildMockIdeas } from '.';

describe('buildMockIdeas', () => {
  it('suggests desserts for a sweet prompt', () => {
    const ideas = buildMockIdeas({ prompt: 'I feel like a Chocolate dessert on Wednesday' });
    expect(ideas).toHaveLength(5);
    expect(ideas[0]?.title).toMatch(/chocolate/i);
  });

  it('suggests dinners otherwise', () => {
    const ideas = buildMockIdeas({ prompt: 'something quick with chicken' });
    expect(ideas).toHaveLength(5);
    expect(ideas.every((idea) => idea.url.startsWith('https://'))).toBe(true);
  });

  it('returns nothing for an empty prompt', () => {
    expect(buildMockIdeas({ prompt: '   ' })).toEqual([]);
  });
});
