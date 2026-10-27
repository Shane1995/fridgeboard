import { useState } from 'react';
import type { CalendarEvent } from '../../types';
import { buildDummyEvents } from '../../utils/buildDummyEvents';
import { buildEvent } from '../../utils/buildEvent';
import { getToday } from '../../utils/getToday';
import type { DeleteEventOptions, SaveEventOptions, UpdateEventOptions } from './types';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    buildDummyEvents({ today: getToday({ now: new Date() }) }),
  );

  const createEvent = ({ draft }: SaveEventOptions) =>
    setEvents((current) => [...current, buildEvent({ draft, id: crypto.randomUUID() })]);

  const updateEvent = ({ id, draft }: UpdateEventOptions) =>
    setEvents((current) =>
      current.map((event) => (event.id === id ? buildEvent({ draft, id }) : event)),
    );

  const deleteEvent = ({ id }: DeleteEventOptions) =>
    setEvents((current) => current.filter((event) => event.id !== id));

  return { events, createEvent, updateEvent, deleteEvent };
};
