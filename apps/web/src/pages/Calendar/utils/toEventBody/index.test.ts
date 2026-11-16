import { toEventBody } from '.';

const draft = {
  title: '  Dentist ',
  allDay: false,
  date: '2026-11-03',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'sub-1',
  note: ' bring card ',
};

describe('toEventBody', () => {
  it('builds a timed body with trimmed text and UTC instants', () => {
    expect(toEventBody({ draft })).toEqual({
      title: 'Dentist',
      note: 'bring card',
      ownerId: 'sub-1',
      allDay: false,
      startsAt: '2026-11-03T09:00:00.000Z',
      endsAt: '2026-11-03T10:00:00.000Z',
    });
  });

  it('turns London summer times into UTC', () => {
    const body = toEventBody({ draft: { ...draft, date: '2026-07-01' } });

    expect(body).toMatchObject({
      startsAt: '2026-07-01T08:00:00.000Z',
      endsAt: '2026-07-01T09:00:00.000Z',
    });
  });

  it('ends the next day when the end time is before the start time', () => {
    const body = toEventBody({ draft: { ...draft, startTime: '22:00', endTime: '02:00' } });

    expect(body).toMatchObject({
      startsAt: '2026-11-03T22:00:00.000Z',
      endsAt: '2026-11-04T02:00:00.000Z',
    });
  });

  it('builds an all-day body on one date without times', () => {
    expect(toEventBody({ draft: { ...draft, allDay: true } })).toEqual({
      title: 'Dentist',
      note: 'bring card',
      ownerId: 'sub-1',
      allDay: true,
      startDate: '2026-11-03',
      endDate: '2026-11-03',
    });
  });
});
