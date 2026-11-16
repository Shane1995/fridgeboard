import type { UseOverlayStateReturn } from '@heroui/react';
import type { Recipe } from '../../../../../../services/recipes/types';

export type RecipePickerDialogProps = {
  state: UseOverlayStateReturn;
  recipes: readonly Recipe[];
  onPick: (options: { recipe: Recipe }) => void;
};
