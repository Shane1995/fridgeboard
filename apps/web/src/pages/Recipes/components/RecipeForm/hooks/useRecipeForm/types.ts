import type { Recipe, RecipeDraft } from '../../../../../../services/recipes/types';

export type UseRecipeFormOptions = {
  recipe: Recipe | undefined;
  onSave: (options: { draft: RecipeDraft }) => void;
};

export type SetTextOptions = {
  field: 'name' | 'servings' | 'sourceUrl' | 'photoUrl' | 'notes';
  value: string;
};

export type SetIngredientOptions = {
  id: string;
  field: 'quantity' | 'unit' | 'item';
  value: string;
};

export type SetStepOptions = { id: string; value: string };

export type RemoveOptions = { id: string };

export type ToggleTagOptions = { tag: string };
