import { useState } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { CALENDAR_COPY } from '../../constants';
import type { CalendarEvent } from '../../types';
import { buildDummyEvents } from '../../utils/buildDummyEvents';
import { buildEvent } from '../../utils/buildEvent';
import { getToday } from '../../utils/getToday';
import type { DeleteEventOptions, SaveEventOptions, UpdateEventOptions } from './types';

export const useCalendarEvents = () => {
  const toast = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    buildDummyEvents({ today: getToday({ now: new Date() }) }),
  );

  const createEvent = ({ draft }: SaveEventOptions) => {
    setEvents((current) => [...current, buildEvent({ draft, id: crypto.randomUUID() })]);
    toast.success(CALENDAR_COPY.eventAdded(draft.title));
  };

  const updateEvent = ({ id, draft }: UpdateEventOptions) => {
    const next = buildEvent({ draft, id });
    const previous = events.find((event) => event.id === id);
    setEvents((current) => current.map((event) => (event.id === id ? next : event)));
    if (JSON.stringify(previous) !== JSON.stringify(next)) {
      toast.success(CALENDAR_COPY.eventUpdated(draft.title));
    }
  };

  const deleteEvent = ({ id }: DeleteEventOptions) => {
    const removed = events.find((event) => event.id === id);
    setEvents((current) => current.filter((event) => event.id !== id));
    if (removed !== undefined) {
      toast.success(CALENDAR_COPY.eventDeleted(removed.title));
    }
  };

  return { events, createEvent, updateEvent, deleteEvent };
};
