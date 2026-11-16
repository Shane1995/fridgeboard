import { useState } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { WEEK_STARTS_ON } from '../../../Calendar/constants';
import type { PlannerPlan, PlannerSection } from '../../types';
import { buildDummyPlanner } from '../../utils/buildDummyPlanner';
import { getToday } from '../../../Calendar/utils/getToday';
import { updateSection } from '../../utils/updateSection';
import { NEW_NOTE_TITLE, PLANNER_TOAST_COPY } from './constants';
import type {
  AddLineOptions,
  AddRecipeLineOptions,
  DeleteNoteOptions,
  RemoveLineOptions,
  RenameNoteOptions,
  RestoreLineOptions,
  UnlinkRecipeOptions,
  UpdateLineOptions,
} from './types';

export const usePlanner = () => {
  const toast = useToast();
  const [plan, setPlan] = useState<PlannerPlan>(() =>
    buildDummyPlanner({ weekStartsOn: WEEK_STARTS_ON }),
  );
  const [todayWeekday] = useState(() =>
    new Date(`${getToday({ now: new Date() })}T00:00:00Z`).getUTCDay(),
  );
  const [focusId, setFocusId] = useState<string | undefined>(undefined);

  const change = ({
    sectionId,
    update,
  }: {
    sectionId: string;
    update: (section: PlannerSection) => PlannerSection;
  }) =>
    setPlan((current) => ({
      days: updateSection({ sections: current.days, sectionId, update }),
      notes: updateSection({ sections: current.notes, sectionId, update }),
    }));

  const addLine = ({ sectionId }: AddLineOptions) => {
    const id = crypto.randomUUID();
    setFocusId(id);
    change({
      sectionId,
      update: (section) => ({ ...section, lines: [...section.lines, { id, text: '' }] }),
    });
  };

  const updateLine = ({ sectionId, lineId, text }: UpdateLineOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.map((line) => (line.id === lineId ? { ...line, text } : line)),
      }),
    });

  const restoreLine = ({ sectionId, line, index }: RestoreLineOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.some(({ id }) => id === line.id)
          ? section.lines
          : [...section.lines.slice(0, index), line, ...section.lines.slice(index)],
      }),
    });

  const removeLine = ({ sectionId, lineId }: RemoveLineOptions) => {
    const lines = [...plan.days, ...plan.notes].find(({ id }) => id === sectionId)?.lines ?? [];
    const index = lines.findIndex(({ id }) => id === lineId);
    const line = lines[index];
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.filter((other) => other.id !== lineId),
      }),
    });
    if (line !== undefined && line.text.trim() !== '') {
      toast.success(PLANNER_TOAST_COPY.lineRemoved, {
        label: PLANNER_TOAST_COPY.undo,
        onPress: () => restoreLine({ sectionId, line, index }),
      });
    }
  };

  const addRecipeLine = ({ sectionId, recipeId, name }: AddRecipeLineOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: [...section.lines, { id: crypto.randomUUID(), text: name, recipeId }],
      }),
    });

  const unlinkRecipe = ({ sectionId, lineId }: UnlinkRecipeOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.map((line) =>
          line.id === lineId ? { ...line, recipeId: undefined } : line,
        ),
      }),
    });

  const addNote = () => {
    const id = crypto.randomUUID();
    setPlan((current) => ({
      ...current,
      notes: [...current.notes, { id, title: NEW_NOTE_TITLE, lines: [] }],
    }));
    toast.success(PLANNER_TOAST_COPY.noteAdded);
  };

  const renameNote = ({ sectionId, title }: RenameNoteOptions) =>
    change({ sectionId, update: (section) => ({ ...section, title }) });

  const deleteNote = ({ sectionId }: DeleteNoteOptions) => {
    const removed = plan.notes.find((note) => note.id === sectionId);
    setPlan((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== sectionId),
    }));
    if (removed !== undefined) {
      toast.success(PLANNER_TOAST_COPY.noteDeleted(removed.title));
    }
  };

  return {
    days: plan.days,
    notes: plan.notes,
    focusId,
    todayWeekday,
    addLine,
    updateLine,
    removeLine,
    addRecipeLine,
    unlinkRecipe,
    addNote,
    renameNote,
    deleteNote,
  };
};
