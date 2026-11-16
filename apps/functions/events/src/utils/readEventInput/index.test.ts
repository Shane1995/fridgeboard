import type { IEvent } from '@fridgeboard/contract/events';
import { readEventInput } from './index.ts';

const timed = {
  title: ' Late shift ',
  ownerId: 'sub-1',
  allDay: false,
  startsAt: '2026-07-01T23:30:00Z',
  endsAt: '2026-07-02T05:00:00Z',
};

const current: IEvent = {
  id: 'e-1',
  title: 'Trip',
  note: 'Pack',
  ownerId: 'household',
  eventType: 'event',
  allDay: true,
  startDate: '2026-11-03',
  endDate: '2026-11-05',
};

describe('readEventInput', () => {
  it('accepts a timed event and derives its London dates', () => {
    expect(readEventInput({ fields: timed })).toEqual({
      event: {
        title: 'Late shift',
        note: '',
        ownerId: 'sub-1',
        eventType: 'event',
        allDay: false,
        startDate: '2026-07-02',
        endDate: '2026-07-02',
        startsAt: '2026-07-01T23:30:00Z',
        endsAt: '2026-07-02T05:00:00Z',
      },
    });
  });

  it('keeps the dates of a shift across the October clock change', () => {
    const result = readEventInput({
      fields: { ...timed, startsAt: '2026-10-24T22:00:00Z', endsAt: '2026-10-25T03:00:00Z' },
    });

    expect(result).toMatchObject({ event: { startDate: '2026-10-24', endDate: '2026-10-25' } });
  });

  it('accepts an all-day event and keeps its note', () => {
    expect(
      readEventInput({
        fields: {
          title: 'Trip',
          note: 'Pack',
          ownerId: 'household',
          allDay: true,
          startDate: '2026-11-03',
          endDate: '2026-11-05',
        },
      }),
    ).toEqual({
      event: {
        title: 'Trip',
        note: 'Pack',
        ownerId: 'household',
        eventType: 'event',
        allDay: true,
        startDate: '2026-11-03',
        endDate: '2026-11-05',
      },
    });
  });

  it('puts the evening after the clocks go back on that day in London', () => {
    expect(
      readEventInput({
        fields: { ...timed, startsAt: '2026-10-25T23:30:00Z', endsAt: '2026-10-26T05:00:00Z' },
      }),
    ).toMatchObject({ event: { startDate: '2026-10-25', endDate: '2026-10-26' } });
  });

  it.each([
    '1',
    'July 1 2026',
    '2026-07-01T23:30',
    '2026-07-01T23:30:00+05:00',
    '+275760-09-13T00:00:00Z',
  ])('refuses the time %j that is not an ISO UTC instant', (startsAt) => {
    expect(readEventInput({ fields: { ...timed, startsAt } })).toEqual({
      reason: 'invalid-time',
    });
  });

  it('stores instants in one form', () => {
    expect(
      readEventInput({
        fields: { ...timed, startsAt: '2026-07-01T23:30:00.000Z', endsAt: '2026-07-02T05:00Z' },
      }),
    ).toMatchObject({
      event: { startsAt: '2026-07-01T23:30:00Z', endsAt: '2026-07-02T05:00:00Z' },
    });
  });

  it('accepts an end equal to the start because the web form allows identical times', () => {
    expect(readEventInput({ fields: { ...timed, endsAt: timed.startsAt } })).toMatchObject({
      event: { startsAt: timed.startsAt, endsAt: timed.startsAt },
    });
  });

  it('refuses an end before the start', () => {
    expect(readEventInput({ fields: { ...timed, endsAt: '2026-07-01T10:00:00Z' } })).toEqual({
      reason: 'invalid-time',
    });
  });

  it('refuses a time that is not a date', () => {
    expect(readEventInput({ fields: { ...timed, startsAt: 'soon' } })).toEqual({
      reason: 'invalid-time',
    });
  });

  it('accepts an all-day event of 31 days and refuses 32', () => {
    const allDay = { title: 'Trip', ownerId: 'household', allDay: true, startDate: '2026-11-01' };

    expect(readEventInput({ fields: { ...allDay, endDate: '2026-12-02' } })).toHaveProperty(
      'event',
    );
    expect(readEventInput({ fields: { ...allDay, endDate: '2026-12-03' } })).toEqual({
      reason: 'invalid-range',
    });
  });

  it('refuses a timed event that lasts more than 31 days', () => {
    expect(readEventInput({ fields: { ...timed, endsAt: '2026-09-01T00:00:00Z' } })).toEqual({
      reason: 'invalid-range',
    });
  });

  it.each([
    ['2026-02-30', '2026-03-01'],
    ['2026-11-05', '2026-11-03'],
    ['nope', '2026-11-03'],
  ])('refuses the all-day dates %s to %s', (startDate, endDate) => {
    expect(
      readEventInput({
        fields: { title: 'Trip', ownerId: 'household', allDay: true, startDate, endDate },
      }),
    ).toEqual({ reason: 'invalid-date' });
  });

  it.each([
    [{ ...timed, title: 'x'.repeat(81) }],
    [{ ...timed, title: '   ' }],
    [{ ...timed, title: 3 }],
  ])('refuses the title in %j', (fields) => {
    expect(readEventInput({ fields })).toEqual({ reason: 'invalid-title' });
  });

  it('refuses a note over 500 characters or one that is not text', () => {
    expect(readEventInput({ fields: { ...timed, note: 'x'.repeat(501) } })).toEqual({
      reason: 'invalid-note',
    });
    expect(readEventInput({ fields: { ...timed, note: 4 } })).toEqual({ reason: 'invalid-note' });
  });

  it('refuses an owner that is not text', () => {
    expect(readEventInput({ fields: { ...timed, ownerId: 7 } })).toEqual({
      reason: 'invalid-owner',
    });
  });

  it('refuses an all-day flag that is not a boolean', () => {
    expect(readEventInput({ fields: { ...timed, allDay: 'yes' } })).toEqual({
      reason: 'invalid-request',
    });
  });

  it('keeps a colour and a reminder', () => {
    expect(readEventInput({ fields: { ...timed, color: 'mint', reminder: 360 } })).toMatchObject({
      event: { color: 'mint', reminder: 360 },
    });
  });

  it('leaves colour and reminder out when none is given', () => {
    const result = readEventInput({ fields: timed });

    expect(result).toHaveProperty('event');
    expect(result).not.toHaveProperty('event.color');
    expect(result).not.toHaveProperty('event.reminder');
  });

  it.each(['beige', 3])('refuses the colour %j', (color) => {
    expect(readEventInput({ fields: { ...timed, color } })).toEqual({ reason: 'invalid-color' });
  });

  it.each([-1, 1.5, 10081, '5'])('refuses the reminder %j', (reminder) => {
    expect(readEventInput({ fields: { ...timed, reminder } })).toEqual({
      reason: 'invalid-reminder',
    });
  });

  it('accepts a reminder of 0 and of a week', () => {
    expect(readEventInput({ fields: { ...timed, reminder: 0 } })).toHaveProperty('event');
    expect(readEventInput({ fields: { ...timed, reminder: 10080 } })).toHaveProperty('event');
  });

  it('keeps the current colour and reminder on a patch and clears them with null', () => {
    const withExtras: IEvent = { ...current, color: 'sky', reminder: 60 };

    expect(readEventInput({ fields: { title: 'Holiday' }, current: withExtras })).toMatchObject({
      event: { color: 'sky', reminder: 60 },
    });
    const cleared = readEventInput({
      fields: { color: null, reminder: null },
      current: withExtras,
    });
    expect(cleared).toHaveProperty('event');
    expect(cleared).not.toHaveProperty('event.color');
    expect(cleared).not.toHaveProperty('event.reminder');
  });

  it('keeps every other current field when a patch sends only the title', () => {
    expect(readEventInput({ fields: { title: 'Holiday' }, current })).toEqual({
      event: {
        title: 'Holiday',
        note: 'Pack',
        ownerId: 'household',
        eventType: 'event',
        allDay: true,
        startDate: '2026-11-03',
        endDate: '2026-11-05',
      },
    });
  });

  it('refuses a patch that makes an all-day event timed without times', () => {
    expect(readEventInput({ fields: { allDay: false }, current })).toEqual({
      reason: 'invalid-time',
    });
  });

  it('refuses a patch that makes a timed event all-day without dates', () => {
    const currentTimed: IEvent = {
      ...current,
      allDay: false,
      startsAt: '2026-11-03T09:00:00Z',
      endsAt: '2026-11-03T10:00:00Z',
    };

    expect(readEventInput({ fields: { allDay: true }, current: currentTimed })).toEqual({
      reason: 'invalid-date',
    });
  });
});
