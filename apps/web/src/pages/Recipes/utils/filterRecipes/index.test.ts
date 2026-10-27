import { MOCK_RECIPES } from '../../../../Context/RecipeBook/constants';
import { filterRecipes } from '.';

describe('filterRecipes', () => {
  it('returns everything for an empty search, favourites first', () => {
    const result = filterRecipes({ recipes: MOCK_RECIPES, query: '', tag: undefined });
    expect(result).toHaveLength(MOCK_RECIPES.length);
    expect(result[0]?.isFavourite).toBe(true);
  });

  it('matches by name, ignoring case', () => {
    const result = filterRecipes({ recipes: MOCK_RECIPES, query: 'SOUP', tag: undefined });
    expect(result.map((recipe) => recipe.name)).toEqual(['Butternut squash soup']);
  });

  it('matches by ingredient', () => {
    const result = filterRecipes({ recipes: MOCK_RECIPES, query: 'kidney', tag: undefined });
    expect(result.map((recipe) => recipe.name)).toEqual(['Veggie chilli']);
  });

  it('filters by tag together with the search', () => {
    const veggie = filterRecipes({ recipes: MOCK_RECIPES, query: '', tag: 'veggie' });
    expect(veggie).toHaveLength(2);
    const narrowed = filterRecipes({ recipes: MOCK_RECIPES, query: 'chilli', tag: 'veggie' });
    expect(narrowed).toHaveLength(1);
  });

  it('does not change the list it was given', () => {
    const copy = [...MOCK_RECIPES];
    filterRecipes({ recipes: MOCK_RECIPES, query: '', tag: undefined });
    expect(MOCK_RECIPES).toEqual(copy);
  });
});
