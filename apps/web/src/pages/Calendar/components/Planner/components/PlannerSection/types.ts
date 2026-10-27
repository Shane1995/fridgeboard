import type { ShopColor } from '../../../../../../services/shoppingList/constants';
import type { PlannerSection as Section } from '../../../../types';
import type {
  AddLineOptions,
  UnlinkRecipeOptions,
  DeleteNoteOptions,
  RemoveLineOptions,
  RenameNoteOptions,
  UpdateLineOptions,
} from '../../../../hooks/usePlanner/types';

export type PlannerSectionProps = {
  section: Section;
  color: ShopColor;
  isToday: boolean;
  focusId: string | undefined;
  onAddLine: (options: AddLineOptions) => void;
  onUpdateLine: (options: UpdateLineOptions) => void;
  onRemoveLine: (options: RemoveLineOptions) => void;
  knownRecipeIds: ReadonlySet<string>;
  onPickRecipe: (options: { sectionId: string; lineId: string }) => void;
  onUnlinkRecipe: (options: UnlinkRecipeOptions) => void;
  onRename?: (options: RenameNoteOptions) => void;
  onDelete?: (options: DeleteNoteOptions) => void;
};
