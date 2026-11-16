import type { PlannerSection } from '../../../../types';

export type WeekGlanceProps = {
  days: readonly PlannerSection[];
  selectedWeekday: number;
  onSelect: (options: { weekday: number }) => void;
};
