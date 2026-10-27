import type { RecipeIngredient } from '../../services/recipes/types';

export type RecipeScreen =
  | { kind: 'list' }
  | { kind: 'detail'; recipeId: string }
  | { kind: 'form'; recipeId: string | undefined }
  | { kind: 'review'; importId: string };

export type RecipesSearch = { recipe?: string; url?: string };

export type FormIngredient = { id: string; quantity: string; unit: string; item: string };

export type FormStep = { id: string; text: string };

export type RecipeFormDraft = {
  name: string;
  servings: string;
  sourceUrl: string;
  photoUrl: string;
  ingredients: FormIngredient[];
  steps: FormStep[];
  notes: string;
  tags: string[];
};

export type IngredientLine = Pick<RecipeIngredient, 'quantity' | 'unit' | 'item'>;
