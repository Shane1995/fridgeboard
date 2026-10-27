import { resolveEventTimes } from '.';

describe('resolveEventTimes', () => {
  it('keeps an end after the start on the same day', () => {
    expect(resolveEventTimes({ date: '2026-11-03', startTime: '09:00', endTime: '10:30' })).toEqual(
      {
        startsAt: '2026-11-03T09:00:00.000Z',
        endsAt: '2026-11-03T10:30:00.000Z',
      },
    );
  });

  it('moves an end earlier than the start to the next day', () => {
    expect(resolveEventTimes({ date: '2026-11-03', startTime: '22:00', endTime: '01:00' })).toEqual(
      {
        startsAt: '2026-11-03T22:00:00.000Z',
        endsAt: '2026-11-04T01:00:00.000Z',
      },
    );
  });

  it('converts London summer time to UTC', () => {
    expect(resolveEventTimes({ date: '2026-07-15', startTime: '18:00', endTime: '19:00' })).toEqual(
      {
        startsAt: '2026-07-15T17:00:00.000Z',
        endsAt: '2026-07-15T18:00:00.000Z',
      },
    );
  });
});
