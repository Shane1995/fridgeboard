import { DAYS_PER_WEEK } from '../../constants';
import type { PlannerPlan, PlannerSection } from '../../types';
import { formatWeekdayName } from '../formatWeekdayName';
import { DUMMY_DAY_LINES, DUMMY_NOTES } from './constants';
import type { BuildDummyPlannerOptions } from './types';

const toLines = ({ id, texts }: { id: string; texts: readonly string[] }) =>
  texts.map((text, index) => ({ id: `${id}-line-${index}`, text }));

export const buildDummyPlanner = ({ weekStartsOn }: BuildDummyPlannerOptions): PlannerPlan => ({
  days: Array.from({ length: DAYS_PER_WEEK }, (_, index): PlannerSection => {
    const weekday = (weekStartsOn + index) % DAYS_PER_WEEK;
    const id = `day-${weekday}`;
    return {
      id,
      weekday,
      title: formatWeekdayName({ weekday }),
      lines: toLines({ id, texts: DUMMY_DAY_LINES[weekday] ?? [] }),
    };
  }),
  notes: DUMMY_NOTES.map((note, index): PlannerSection => {
    const id = `note-${index}`;
    return { id, title: note.title, lines: toLines({ id, texts: note.lines }) };
  }),
});
