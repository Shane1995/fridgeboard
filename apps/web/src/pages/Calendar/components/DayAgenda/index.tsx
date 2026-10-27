import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { CALENDAR_COPY } from '../../constants';
import { formatDayHeading } from '../../utils/formatDayHeading';
import { EventRow } from '../EventRow';
import type { DayAgendaProps } from './types';

export const DayAgenda = ({ date, events, onEdit }: DayAgendaProps) => {
  return (
    <section aria-label={formatDayHeading({ date })} className="flex flex-col gap-1">
      <Typography variant={TypographyVariant.Heading3} as="h3">
        {formatDayHeading({ date })}
      </Typography>
      {events.length === 0 ? (
        <Typography variant={TypographyVariant.Caption}>{CALENDAR_COPY.noEvents}</Typography>
      ) : (
        events.map((event) => <EventRow key={event.id} event={event} onEdit={onEdit} />)
      )}
    </section>
  );
};
