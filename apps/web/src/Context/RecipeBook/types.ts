import type { Recipe, RecipeDraft, RecipeImport } from '../../services/recipes/types';

export type CreateRecipeOptions = { draft: RecipeDraft };

export type UpdateRecipeOptions = { id: string; draft: RecipeDraft };

export type RecipeIdOptions = { id: string };

export type StartImportOptions = { source: string };

export type SaveImportOptions = { id: string; draft: RecipeDraft };

export type RecipeBookApi = {
  recipes: readonly Recipe[];
  imports: readonly RecipeImport[];
  createRecipe: (options: CreateRecipeOptions) => string;
  updateRecipe: (options: UpdateRecipeOptions) => void;
  deleteRecipe: (options: RecipeIdOptions) => void;
  toggleFavourite: (options: RecipeIdOptions) => void;
  startImport: (options: StartImportOptions) => string;
  retryImport: (options: RecipeIdOptions) => void;
  discardImport: (options: RecipeIdOptions) => void;
  saveImport: (options: SaveImportOptions) => string;
};
