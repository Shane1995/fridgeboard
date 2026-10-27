import { compareEvents } from '.';

const base = { id: 'a', ownerId: 'household', note: '' };

describe('compareEvents', () => {
  it('puts all-day events before timed ones', () => {
    const allDay = { ...base, title: 'Bins', allDay: true as const, startDate: 'd', endDate: 'd' };
    const timed = {
      ...base,
      title: 'Dentist',
      allDay: false as const,
      startsAt: '2026-11-03T09:00:00.000Z',
      endsAt: '2026-11-03T10:00:00.000Z',
    };
    expect(compareEvents({ left: allDay, right: timed })).toBeLessThan(0);
    expect(compareEvents({ left: timed, right: allDay })).toBeGreaterThan(0);
  });

  it('orders timed events by start then title', () => {
    const early = {
      ...base,
      title: 'B',
      allDay: false as const,
      startsAt: '2026-11-03T08:00:00.000Z',
      endsAt: '2026-11-03T09:00:00.000Z',
    };
    const late = { ...early, title: 'A', startsAt: '2026-11-03T12:00:00.000Z' };
    expect(compareEvents({ left: early, right: late })).toBeLessThan(0);
    expect(compareEvents({ left: early, right: { ...early, title: 'C' } })).toBeLessThan(0);
  });
});
