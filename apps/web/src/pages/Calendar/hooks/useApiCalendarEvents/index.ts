import { useMemo } from 'react';
import { useEventsQuery } from '../../../../hooks/useEventsQuery';
import type { CalendarEvent } from '../../types';
import { eventDateRange } from '../../utils/eventDateRange';
import { eventToDraft } from '../../utils/eventToDraft';
import { toCalendarEvent } from '../../utils/toCalendarEvent';
import { toEventBody } from '../../utils/toEventBody';
import { useEventMutations } from '../useEventMutations';
import type { CalendarEventsState } from '../useLocalCalendarEvents/types';
import type {
  DeleteEventOptions,
  SaveEventOptions,
  UpdateEventOptions,
} from '../useLocalCalendarEvents/types';
import type { UseApiCalendarEventsOptions } from './types';

const NO_EVENTS: CalendarEvent[] = [];

// The calendar's events from the server: one request per window, one per save.
export const useApiCalendarEvents = ({
  from,
  to,
  enabled = true,
}: UseApiCalendarEventsOptions): CalendarEventsState => {
  const { data } = useEventsQuery({ from, to, enabled });
  const events = useMemo(
    () => (data === undefined ? NO_EVENTS : data.map((event) => toCalendarEvent({ event }))),
    [data],
  );
  const { createEvent, updateEvent, deleteEvent } = useEventMutations();
  const find = (id: string) => events.find((event) => event.id === id);

  return {
    events,
    createEvent: ({ draft }: SaveEventOptions) =>
      createEvent.mutate({ body: toEventBody({ draft }) }),
    updateEvent: ({ id, draft }: UpdateEventOptions) => {
      const current = find(id);
      if (current === undefined) {
        return;
      }
      const body = toEventBody({ draft });
      if (
        JSON.stringify(body) ===
        JSON.stringify(toEventBody({ draft: eventToDraft({ event: current }) }))
      ) {
        return;
      }
      updateEvent.mutate({ id, date: eventDateRange({ event: current }).startDate, body });
    },
    deleteEvent: ({ id }: DeleteEventOptions) => {
      const current = find(id);
      if (current !== undefined) {
        deleteEvent.mutate({
          id,
          date: eventDateRange({ event: current }).startDate,
          title: current.title,
        });
      }
    },
  };
};
