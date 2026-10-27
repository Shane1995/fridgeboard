import type { RecipeDraft } from '../../../../services/recipes/types';

export type RecipeFormProps = {
  title: string;
  recipe: RecipeDraft | undefined;
  onSave: (options: { draft: RecipeDraft }) => void;
  onCancel: () => void;
};
