import type { PlannerSection } from '../../types';
import type {
  AddLineOptions,
  AddRecipeLineOptions,
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
  onUnlinkRecipe: (options: UnlinkRecipeOptions) => void;
};
