import type { Recipe } from '../../services/recipes/types';

export type FilterRecipesOptions = {
  recipes: readonly Recipe[];
  query: string;
  tag: string | undefined;
};
