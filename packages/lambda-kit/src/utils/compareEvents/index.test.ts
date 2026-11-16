import type { IEvent } from '@fridgeboard/contract/events';
import { compareEvents } from './index.ts';

const base = { title: '', note: '', ownerId: 'household', eventType: 'event' } as const;

const allDay = (id: string, startDate: string): IEvent => ({
  ...base,
  id,
  allDay: true,
  startDate,
  endDate: startDate,
});

const timed = (id: string, startDate: string, startsAt: string): IEvent => ({
  ...base,
  id,
  allDay: false,
  startDate,
  endDate: startDate,
  startsAt,
  endsAt: startsAt,
});

describe('compareEvents', () => {
  it('orders by start date, then all-day before timed, then time, then id', () => {
    const events = [
      timed('c', '2026-11-03', '2026-11-03T15:00:00Z'),
      allDay('z', '2026-11-03'),
      timed('b', '2026-11-03', '2026-11-03T09:00:00Z'),
      timed('a', '2026-11-03', '2026-11-03T09:00:00Z'),
      allDay('first', '2026-11-02'),
    ];

    expect(events.sort(compareEvents).map(({ id }) => id)).toEqual(['first', 'z', 'a', 'b', 'c']);
  });
});
