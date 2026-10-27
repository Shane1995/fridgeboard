import type { CalendarEvent } from '../../../../types';

export type DayCellProps = {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: readonly CalendarEvent[];
  onSelect: (date: string) => void;
};
