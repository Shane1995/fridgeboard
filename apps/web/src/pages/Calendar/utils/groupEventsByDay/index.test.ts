import { groupEventsByDay } from '.';

const base = { ownerId: 'household', note: '' };

describe('groupEventsByDay', () => {
  it('places events on their days, all-day first', () => {
    const grouped = groupEventsByDay({
      dates: ['2026-11-03', '2026-11-04'],
      events: [
        {
          ...base,
          id: '1',
          title: 'Dentist',
          allDay: false,
          startsAt: '2026-11-03T10:00:00.000Z',
          endsAt: '2026-11-03T11:00:00.000Z',
        },
        {
          ...base,
          id: '2',
          title: 'Bins',
          allDay: true,
          startDate: '2026-11-03',
          endDate: '2026-11-03',
        },
      ],
    });
    expect(grouped['2026-11-03']?.map((event) => event.title)).toEqual(['Bins', 'Dentist']);
    expect(grouped['2026-11-04']).toEqual([]);
  });

  it('shows an event on both days when it crosses midnight', () => {
    const grouped = groupEventsByDay({
      dates: ['2026-11-03', '2026-11-04'],
      events: [
        {
          ...base,
          id: '1',
          title: 'Night out',
          allDay: false,
          startsAt: '2026-11-03T22:00:00.000Z',
          endsAt: '2026-11-04T01:00:00.000Z',
        },
      ],
    });
    expect(grouped['2026-11-03']).toHaveLength(1);
    expect(grouped['2026-11-04']).toHaveLength(1);
  });
});
