import type { CalendarEvent, MonthCell } from '../../types';

export type MonthGridProps = {
  cells: readonly (readonly MonthCell[])[];
  anchor: string;
  today: string;
  eventsByDay: Readonly<Record<string, readonly CalendarEvent[]>>;
  onSelectDay: (date: string) => void;
};
