import type { Recipe, RecipeDraft } from '../../services/recipes/types';

export type CreateRecipeOptions = { draft: RecipeDraft };

export type UpdateRecipeOptions = { id: string; draft: RecipeDraft };

export type RecipeIdOptions = { id: string };

export type RecipeBookApi = {
  recipes: readonly Recipe[];
  createRecipe: (options: CreateRecipeOptions) => string;
  updateRecipe: (options: UpdateRecipeOptions) => void;
  deleteRecipe: (options: RecipeIdOptions) => void;
  toggleFavourite: (options: RecipeIdOptions) => void;
};
