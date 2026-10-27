import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { CALENDAR_COPY } from '../../constants';
import { formatDayHeading } from '../../utils/formatDayHeading';
import { EventRow } from '../EventRow';
import type { WeekViewProps } from './types';

export const WeekView = ({
  dates,
  today,
  anchor,
  eventsByDay,
  onSelectDay,
  onEdit,
}: WeekViewProps) => {
  return (
    <div className="flex flex-col gap-3">
      {dates.map((date) => {
        const events = eventsByDay[date] ?? [];
        return (
          <section
            key={date}
            aria-label={formatDayHeading({ date })}
            className={`flex flex-col gap-1 rounded-2xl border p-2 ${date === anchor ? 'border-accent' : 'border-separator'}`}
          >
            <button
              type="button"
              onClick={() => onSelectDay(date)}
              className={`cursor-pointer self-start rounded-lg px-2 py-1 text-left font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus ${date === today ? 'text-accent' : ''}`}
            >
              {formatDayHeading({ date })}
            </button>
            {events.length === 0 ? (
              <Typography variant={TypographyVariant.Caption} className="px-2">
                {CALENDAR_COPY.noEvents}
              </Typography>
            ) : (
              events.map((event) => <EventRow key={event.id} event={event} onEdit={onEdit} />)
            )}
          </section>
        );
      })}
    </div>
  );
};
