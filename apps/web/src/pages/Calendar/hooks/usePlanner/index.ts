import { useState } from 'react';
import { WEEK_STARTS_ON } from '../../constants';
import type { PlannerPlan, PlannerSection } from '../../types';
import { buildDummyPlanner } from '../../utils/buildDummyPlanner';
import { getToday } from '../../utils/getToday';
import { updateSection } from '../../utils/updateSection';
import { NEW_NOTE_TITLE } from './constants';
import type {
  AddLineOptions,
  DeleteNoteOptions,
  LinkRecipeOptions,
  RemoveLineOptions,
  RenameNoteOptions,
  UnlinkRecipeOptions,
  UpdateLineOptions,
} from './types';

export const usePlanner = () => {
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

  const removeLine = ({ sectionId, lineId }: RemoveLineOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.filter((line) => line.id !== lineId),
      }),
    });

  const linkRecipe = ({ sectionId, lineId, recipeId, name }: LinkRecipeOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.map((line) =>
          line.id === lineId ? { ...line, recipeId, text: name } : line,
        ),
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
  };

  const renameNote = ({ sectionId, title }: RenameNoteOptions) =>
    change({ sectionId, update: (section) => ({ ...section, title }) });

  const deleteNote = ({ sectionId }: DeleteNoteOptions) =>
    setPlan((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== sectionId),
    }));

  return {
    days: plan.days,
    notes: plan.notes,
    focusId,
    todayWeekday,
    addLine,
    updateLine,
    removeLine,
    linkRecipe,
    unlinkRecipe,
    addNote,
    renameNote,
    deleteNote,
  };
};
