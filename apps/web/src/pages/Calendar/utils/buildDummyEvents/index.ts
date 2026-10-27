import type { CalendarEvent } from '../../types';
import { addDays } from '../addDays';
import { buildEvent } from '../buildEvent';
import { DUMMY_EVENT_SPECS } from './constants';
import type { BuildDummyEventsOptions } from './types';

export const buildDummyEvents = ({ today }: BuildDummyEventsOptions): CalendarEvent[] =>
  DUMMY_EVENT_SPECS.map((spec, index) =>
    buildEvent({
      id: `dummy-${index}`,
      draft: {
        title: spec.title,
        allDay: spec.allDay,
        date: addDays({ date: today, days: spec.offset }),
        startTime: spec.startTime,
        endTime: spec.endTime,
        ownerId: spec.ownerId,
        note: spec.note,
      },
    }),
  );
