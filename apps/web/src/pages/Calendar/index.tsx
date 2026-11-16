import { PageShell } from '../../components/PageShell';
import { Typography } from '../../components/Typography';
import { CALENDAR_COPY, CalendarView } from './constants';
import { CalendarToolbar } from './components/CalendarToolbar';
import { DayAgenda } from './components/DayAgenda';
import { EventDialog } from './components/EventDialog';
import { MonthGrid } from './components/MonthGrid';
import { OwnerLegend } from './components/OwnerLegend';
import { WeekView } from './components/WeekView';
import { useCalendar } from './hooks/useCalendar';

export const Calendar = () => {
  const calendar = useCalendar();

  if (!calendar.enabled) {
    return (
      <PageShell title={CALENDAR_COPY.title}>
        <Typography>{CALENDAR_COPY.placeholder}</Typography>
      </PageShell>
    );
  }

  return (
    <PageShell title={CALENDAR_COPY.title}>
      <CalendarToolbar
        title={calendar.title}
        view={calendar.view}
        onViewChange={calendar.setView}
        onPrevious={() => calendar.step({ direction: -1 })}
        onNext={() => calendar.step({ direction: 1 })}
        onToday={calendar.goToday}
        onAdd={() => calendar.openCreate({ date: calendar.anchor })}
      />
      {calendar.view === CalendarView.Month && (
        <>
          <MonthGrid
            cells={calendar.cells}
            anchor={calendar.anchor}
            today={calendar.today}
            eventsByDay={calendar.eventsByDay}
            onSelectDay={(date) => calendar.selectDay({ date })}
            onAddDay={(date) => calendar.openCreate({ date })}
          />
          <DayAgenda
            date={calendar.anchor}
            events={calendar.eventsByDay[calendar.anchor] ?? []}
            onEdit={(event) => calendar.openEdit({ event })}
          />
        </>
      )}
      {calendar.view === CalendarView.Week && (
        <WeekView
          dates={calendar.weekDates}
          today={calendar.today}
          anchor={calendar.anchor}
          eventsByDay={calendar.eventsByDay}
          onSelectDay={(date) => calendar.selectDay({ date })}
          onAdd={(date) => calendar.openCreate({ date })}
          onEdit={(event) => calendar.openEdit({ event })}
        />
      )}
      <OwnerLegend />
      <EventDialog
        key={calendar.editing?.id ?? calendar.anchor}
        state={calendar.dialog}
        event={calendar.editing}
        date={calendar.anchor}
        onSave={(draft) => calendar.saveDraft({ draft })}
        onDelete={calendar.removeEditing}
      />
    </PageShell>
  );
};
