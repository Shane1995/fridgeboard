import { renderHook } from '@testing-library/react';
import { MISSING_RECIPE_BOOK_MESSAGE } from '../../Context/RecipeBook/constants';
import { useRecipeBook } from '.';

describe('useRecipeBook', () => {
  it('throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useRecipeBook())).toThrow(MISSING_RECIPE_BOOK_MESSAGE);
  });
});
