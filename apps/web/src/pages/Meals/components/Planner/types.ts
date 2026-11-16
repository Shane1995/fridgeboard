import type { PlannerSection } from '../../types';
import type {
  AddLineOptions,
  AddRecipeLineOptions,
  SetLineRecipeOptions,
  UnlinkRecipeOptions,
  RemoveLineOptions,
  UpdateLineOptions,
} from '../../hooks/usePlanner/types';

export type SectionStyle = { surface: string; border: string };

export type PlannerProps = {
  days: readonly PlannerSection[];
  focusId: string | undefined;
  todayWeekday: number;
  onAddLine: (options: AddLineOptions) => void;
  onUpdateLine: (options: UpdateLineOptions) => void;
  onRemoveLine: (options: RemoveLineOptions) => void;
  onAddRecipeLine: (options: AddRecipeLineOptions) => void;
  onSetLineRecipe: (options: SetLineRecipeOptions) => void;
  onUnlinkRecipe: (options: UnlinkRecipeOptions) => void;
};
