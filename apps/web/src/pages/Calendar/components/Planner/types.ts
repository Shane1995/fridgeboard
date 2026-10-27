import type { PlannerSection } from '../../types';
import type {
  AddLineOptions,
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
  onAddNote: () => void;
  onRenameNote: (options: RenameNoteOptions) => void;
  onDeleteNote: (options: DeleteNoteOptions) => void;
};
