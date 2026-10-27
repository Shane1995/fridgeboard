import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { useRecipeBook } from '../../hooks/useRecipeBook';
import { RecipeBookProvider } from '.';

const wrapper = ({ children }: PropsWithChildren) => (
  <RecipeBookProvider>{children}</RecipeBookProvider>
);

const draft = {
  name: 'Pancakes',
  sourceUrl: '',
  photoUrl: '',
  servings: 2,
  ingredients: [],
  steps: [],
  notes: '',
  tags: [],
};

describe('RecipeBookProvider', () => {
  it('starts with the mock recipes', () => {
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    expect(result.current.recipes.length).toBeGreaterThan(0);
  });

  it('creates, updates, favourites and deletes a recipe', () => {
    const { result } = renderHook(() => useRecipeBook(), { wrapper });
    const before = result.current.recipes.length;

    let id = '';
    act(() => {
      id = result.current.createRecipe({ draft });
    });
    expect(result.current.recipes).toHaveLength(before + 1);

    act(() => result.current.updateRecipe({ id, draft: { ...draft, name: 'Crepes' } }));
    expect(result.current.recipes.find((recipe) => recipe.id === id)?.name).toBe('Crepes');

    act(() => result.current.toggleFavourite({ id }));
    expect(result.current.recipes.find((recipe) => recipe.id === id)?.isFavourite).toBe(true);

    act(() => result.current.deleteRecipe({ id }));
    expect(result.current.recipes).toHaveLength(before);
  });
});
