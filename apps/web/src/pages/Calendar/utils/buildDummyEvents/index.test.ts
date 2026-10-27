import { buildDummyEvents } from '.';

describe('buildDummyEvents', () => {
  it('places an event on today', () => {
    const events = buildDummyEvents({ today: '2026-11-03' });
    expect(events.some((event) => !event.allDay && event.startsAt.startsWith('2026-11-03'))).toBe(
      true,
    );
  });

  it('gives every event a unique id', () => {
    const ids = buildDummyEvents({ today: '2026-11-03' }).map((event) => event.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
