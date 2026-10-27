import { createFileRoute } from '@tanstack/react-router';
import { Recipes } from '../../pages/Recipes';
import { RECIPES_SEARCH_PATTERN } from '../../pages/Recipes/constants';

export const Route = createFileRoute('/_authenticated/recipes')({
  validateSearch: (search: Record<string, unknown>): { recipe?: string } =>
    typeof search.recipe === 'string' && RECIPES_SEARCH_PATTERN.test(search.recipe)
      ? { recipe: search.recipe }
      : {},
  component: Recipes,
});
