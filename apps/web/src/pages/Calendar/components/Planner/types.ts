import type { PlannerSection } from '../../types';
import type {
  AddLineOptions,
  LinkRecipeOptions,
  UnlinkRecipeOptions,
  DeleteNoteOptions,
  RemoveLineOptions,
  RenameNoteOptions,
  UpdateLineOptions,
} from '../../hooks/usePlanner/types';

export type SectionStyle = { surface: string; border: string };

export type PlannerProps = {
  days: readonly PlannerSection[];
  notes: readonly PlannerSection[];
  focusId: string | undefined;
  todayWeekday: number;
  onAddLine: (options: AddLineOptions) => void;
  onUpdateLine: (options: UpdateLineOptions) => void;
  onRemoveLine: (options: RemoveLineOptions) => void;
  onLinkRecipe: (options: LinkRecipeOptions) => void;
  onUnlinkRecipe: (options: UnlinkRecipeOptions) => void;
  onAddNote: () => void;
  onRenameNote: (options: RenameNoteOptions) => void;
  onDeleteNote: (options: DeleteNoteOptions) => void;
};
