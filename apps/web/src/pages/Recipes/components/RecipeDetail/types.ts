import type { Recipe } from '../../../../services/recipes/types';

export type RecipeDetailProps = {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (options: { id: string }) => void;
  onDelete: (options: { id: string }) => void;
  onToggleFavourite: (options: { id: string }) => void;
};
