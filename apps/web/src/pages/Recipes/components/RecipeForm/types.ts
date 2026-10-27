import type { Recipe, RecipeDraft } from '../../../../services/recipes/types';

export type RecipeFormProps = {
  recipe: Recipe | undefined;
  onSave: (options: { draft: RecipeDraft }) => void;
  onCancel: () => void;
};
