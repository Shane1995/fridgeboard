import { lastDay } from '.';

const draft = {
  title: 'Trip',
  allDay: true,
  date: '2026-11-03',
  startTime: '09:00',
  endTime: '10:00',
  ownerId: 'household',
  note: '',
};

describe('lastDay', () => {
  it('is the first day when the draft names no last day', () => {
    expect(lastDay({ draft })).toBe('2026-11-03');
  });

  it('is the last day the draft names', () => {
    expect(lastDay({ draft: { ...draft, endDate: '2026-11-06' } })).toBe('2026-11-06');
  });

  it('is never before the first day', () => {
    expect(lastDay({ draft: { ...draft, endDate: '2026-11-01' } })).toBe('2026-11-03');
  });
});
