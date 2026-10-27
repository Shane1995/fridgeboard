import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { CALENDAR_COPY, CalendarView } from './constants';
import { CalendarToolbar } from './components/CalendarToolbar';
import { DayAgenda } from './components/DayAgenda';
import { EventDialog } from './components/EventDialog';
import { MonthGrid } from './components/MonthGrid';
import { OwnerLegend } from './components/OwnerLegend';
import { Planner } from './components/Planner';
import { WeekView } from './components/WeekView';
import { useCalendar } from './hooks/useCalendar';
import { usePlanner } from './hooks/usePlanner';

export const Calendar = () => {
  const calendar = useCalendar();
  const planner = usePlanner();

  if (!calendar.enabled) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <PageHeader title={CALENDAR_COPY.title} />
        <Typography>{CALENDAR_COPY.placeholder}</Typography>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <PageHeader title={CALENDAR_COPY.title} />
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
      {calendar.view === CalendarView.Planner && (
        <Planner
          days={planner.days}
          notes={planner.notes}
          focusId={planner.focusId}
          todayWeekday={planner.todayWeekday}
          onAddLine={planner.addLine}
          onUpdateLine={planner.updateLine}
          onRemoveLine={planner.removeLine}
          onLinkRecipe={planner.linkRecipe}
          onUnlinkRecipe={planner.unlinkRecipe}
          onAddNote={planner.addNote}
          onRenameNote={planner.renameNote}
          onDeleteNote={planner.deleteNote}
        />
      )}
      {calendar.view !== CalendarView.Planner && <OwnerLegend />}
      <EventDialog
        key={calendar.editing?.id ?? calendar.anchor}
        state={calendar.dialog}
        event={calendar.editing}
        date={calendar.anchor}
        onSave={(draft) => calendar.saveDraft({ draft })}
        onDelete={calendar.removeEditing}
      />
    </main>
  );
};
