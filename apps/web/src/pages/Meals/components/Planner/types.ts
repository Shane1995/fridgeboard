import type { PlannerSection } from '../../types';
import type {
  AddLineOptions,
  AddRecipeLineOptions,
  SetLineRecipeOptions,
  SwapBackupOptions,
  UnlinkRecipeOptions,
  RemoveLineOptions,
  UpdateLineOptions,
} from '../../hooks/usePlanner/types';

export type PlannerProps = {
  days: readonly PlannerSection[];
  focusId: string | undefined;
  todayWeekday: number;
  onAddLine: (options: AddLineOptions) => void;
  onUpdateLine: (options: UpdateLineOptions) => void;
  onRemoveLine: (options: RemoveLineOptions) => void;
  onAddRecipeLine: (options: AddRecipeLineOptions) => void;
  onSwapBackup: (options: SwapBackupOptions) => void;
  onSetLineRecipe: (options: SetLineRecipeOptions) => void;
  onUnlinkRecipe: (options: UnlinkRecipeOptions) => void;
};
