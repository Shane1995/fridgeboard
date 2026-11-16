import type { Recipe } from '../../../../../../services/recipes/types';
import type { ShopColor } from '../../../../../../services/shoppingList/constants';
import type { PlannerSection as Section } from '../../../../types';
import type {
  AddLineOptions,
  AddRecipeLineOptions,
  UnlinkRecipeOptions,
  RemoveLineOptions,
  UpdateLineOptions,
} from '../../../../hooks/usePlanner/types';

export type PickTarget = { sectionId: string; lineId?: string };

export type PlannerSectionProps = {
  section: Section;
  color: ShopColor;
  isToday: boolean;
  isSelected?: boolean;
  focusId: string | undefined;
  onAddLine: (options: AddLineOptions) => void;
  onUpdateLine: (options: UpdateLineOptions) => void;
  onRemoveLine: (options: RemoveLineOptions) => void;
  suggestions: readonly Recipe[];
  onAddRecipe: (options: AddRecipeLineOptions) => void;
  recipesById: ReadonlyMap<string, Recipe>;
  onAddIngredients: (options: { recipeId: string }) => void;
  onPickRecipe: (options: PickTarget) => void;
  onUnlinkRecipe: (options: UnlinkRecipeOptions) => void;
};
