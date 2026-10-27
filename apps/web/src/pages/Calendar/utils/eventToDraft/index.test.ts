import { eventToDraft } from '.';

const base = { id: 'e1', title: 'Dentist', ownerId: 'shane', note: 'card' };

describe('eventToDraft', () => {
  it('reads London wall times from a timed event', () => {
    expect(
      eventToDraft({
        event: {
          ...base,
          allDay: false,
          startsAt: '2026-07-15T08:00:00.000Z',
          endsAt: '2026-07-15T09:30:00.000Z',
        },
      }),
    ).toEqual({
      title: 'Dentist',
      ownerId: 'shane',
      note: 'card',
      allDay: false,
      date: '2026-07-15',
      startTime: '09:00',
      endTime: '10:30',
    });
  });

  it('falls back to default times for an all-day event', () => {
    expect(
      eventToDraft({
        event: { ...base, allDay: true, startDate: '2026-11-03', endDate: '2026-11-03' },
      }),
    ).toMatchObject({ allDay: true, date: '2026-11-03', startTime: '09:00', endTime: '10:00' });
  });
});
