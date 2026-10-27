import { useOverlayState } from '@heroui/react';
import { useState } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { CalendarView, DAYS_PER_WEEK, WEEK_STARTS_ON } from '../../constants';
import type { CalendarEvent } from '../../types';
import { addDays } from '../../utils/addDays';
import { addMonths } from '../../utils/addMonths';
import { buildMonthGrid } from '../../utils/buildMonthGrid';
import { buildWeek } from '../../utils/buildWeek';
import { formatMonthTitle } from '../../utils/formatMonthTitle';
import { getToday } from '../../utils/getToday';
import { groupEventsByDay } from '../../utils/groupEventsByDay';
import { useCalendarEvents } from '../useCalendarEvents';
import type { EditEventOptions, SaveDraftOptions, SelectDayOptions } from './types';

export const useCalendar = () => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_CALENDAR);
  const [today] = useState(() => getToday({ now: new Date() }));
  const [view, setView] = useState(CalendarView.Month);
  const [anchor, setAnchor] = useState(today);
  const [editing, setEditing] = useState<CalendarEvent | undefined>(undefined);
  const dialog = useOverlayState();
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarEvents();

  const cells = buildMonthGrid({ date: anchor, weekStartsOn: WEEK_STARTS_ON });
  const weekDates = buildWeek({ date: anchor, weekStartsOn: WEEK_STARTS_ON });
  const visibleDates =
    view === CalendarView.Month ? cells.flat().map((cell) => cell.date) : weekDates;
  const eventsByDay = groupEventsByDay({ events, dates: visibleDates });

  const step = ({ direction }: { direction: 1 | -1 }) =>
    setAnchor((current) =>
      view === CalendarView.Month
        ? addMonths({ date: current, months: direction })
        : addDays({ date: current, days: direction * DAYS_PER_WEEK }),
    );

  const selectDay = ({ date }: SelectDayOptions) => setAnchor(date);

  const openCreate = () => {
    setEditing(undefined);
    dialog.open();
  };

  const openEdit = ({ event }: EditEventOptions) => {
    setEditing(event);
    dialog.open();
  };

  const saveDraft = ({ draft }: SaveDraftOptions) =>
    editing === undefined ? createEvent({ draft }) : updateEvent({ id: editing.id, draft });

  const removeEditing = () => {
    if (editing !== undefined) {
      deleteEvent({ id: editing.id });
    }
  };

  return {
    enabled,
    view,
    setView,
    anchor,
    today,
    title: formatMonthTitle({ date: anchor }),
    cells,
    weekDates,
    eventsByDay,
    dialog,
    editing,
    step,
    goToday: () => setAnchor(today),
    selectDay,
    openCreate,
    openEdit,
    saveDraft,
    removeEditing,
  };
};
