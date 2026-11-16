import { useState } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { WEEK_STARTS_ON } from '../../../Calendar/constants';
import type { PlannerPlan, PlannerSection } from '../../types';
import { buildDummyPlanner } from '../../utils/buildDummyPlanner';
import { getToday } from '../../../Calendar/utils/getToday';
import { updateSection } from '../../utils/updateSection';
import { PLANNER_TOAST_COPY } from './constants';
import type {
  AddLineOptions,
  AddRecipeLineOptions,
  RemoveLineOptions,
  RestoreLineOptions,
  SetLineRecipeOptions,
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
    const lines = plan.days.find(({ id }) => id === sectionId)?.lines ?? [];
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

  const setLineRecipe = ({ sectionId, lineId, recipeId, name }: SetLineRecipeOptions) =>
    change({
      sectionId,
      update: (section) => ({
        ...section,
        lines: section.lines.map((line) =>
          line.id === lineId ? { ...line, text: name, recipeId } : line,
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

  return {
    days: plan.days,
    focusId,
    todayWeekday,
    addLine,
    updateLine,
    removeLine,
    addRecipeLine,
    setLineRecipe,
    unlinkRecipe,
  };
};
