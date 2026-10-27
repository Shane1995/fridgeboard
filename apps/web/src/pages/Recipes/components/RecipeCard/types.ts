import type { Recipe } from '../../../../services/recipes/types';

export type RecipeCardProps = {
  recipe: Recipe;
  onOpen: (options: { id: string }) => void;
  onToggleFavourite: (options: { id: string }) => void;
};
