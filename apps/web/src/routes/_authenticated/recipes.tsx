import { createFileRoute } from '@tanstack/react-router';
import { Recipes } from '../../pages/Recipes';
import { RECIPES_SEARCH_PATTERN, RECIPES_URL_MAX_LENGTH } from '../../pages/Recipes/constants';
import type { RecipesSearch } from '../../pages/Recipes/types';

export const Route = createFileRoute('/_authenticated/recipes')({
  validateSearch: (search: Record<string, unknown>): RecipesSearch => ({
    ...(typeof search.recipe === 'string' && RECIPES_SEARCH_PATTERN.test(search.recipe)
      ? { recipe: search.recipe }
      : {}),
    ...(typeof search.url === 'string' && search.url.length <= RECIPES_URL_MAX_LENGTH
      ? { url: search.url }
      : {}),
  }),
  component: Recipes,
});
