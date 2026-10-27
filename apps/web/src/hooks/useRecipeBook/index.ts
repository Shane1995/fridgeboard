import { useContext } from 'react';
import { MISSING_RECIPE_BOOK_MESSAGE } from '../../Context/RecipeBook/constants';
import { RecipeBookContext } from '../../Context/RecipeBook/context';
import type { RecipeBookApi } from '../../Context/RecipeBook/types';

export const useRecipeBook = (): RecipeBookApi => {
  const api = useContext(RecipeBookContext);
  if (!api) {
    throw new Error(MISSING_RECIPE_BOOK_MESSAGE);
  }
  return api;
};
