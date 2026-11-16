import type { IEventRule } from '@fridgeboard/contract/events';
import { expandRule } from './index.ts';

const bins: IEventRule = {
  id: 'r-1',
  title: 'General waste',
  note: '',
  ownerId: 'household',
  allDay: true,
  startDate: '2026-11-05',
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  skip: [],
  color: 'black',
  reminder: 360,
};

const datesOf = (rule: IEventRule, from: string, to: string) =>
  expandRule({ rule, from, to }).map(({ startDate }) => startDate);

describe('expandRule', () => {
  it('repeats every two weeks on a Thursday', () => {
    expect(datesOf(bins, '2026-11-01', '2026-12-31')).toEqual([
      '2026-11-05',
      '2026-11-19',
      '2026-12-03',
      '2026-12-17',
      '2026-12-31',
    ]);
  });

  it('keeps its rhythm when the window starts later', () => {
    expect(datesOf(bins, '2026-12-01', '2026-12-31')).toEqual([
      '2026-12-03',
      '2026-12-17',
      '2026-12-31',
    ]);
  });

  it('has nothing before the start date', () => {
    expect(datesOf(bins, '2026-10-01', '2026-11-04')).toEqual([]);
  });

  it('stops at the until date, which still counts', () => {
    expect(datesOf({ ...bins, until: '2026-11-19' }, '2026-11-01', '2026-12-31')).toEqual([
      '2026-11-05',
      '2026-11-19',
    ]);
  });

  it('leaves out skipped dates', () => {
    expect(datesOf({ ...bins, skip: ['2026-11-19'] }, '2026-11-01', '2026-12-10')).toEqual([
      '2026-11-05',
      '2026-12-03',
    ]);
  });

  it('describes an all-day occurrence', () => {
    expect(expandRule({ rule: bins, from: '2026-11-01', to: '2026-11-07' })).toEqual([
      {
        id: 'r-1_2026-11-05',
        ruleId: 'r-1',
        title: 'General waste',
        note: '',
        ownerId: 'household',
        eventType: 'event',
        allDay: true,
        startDate: '2026-11-05',
        endDate: '2026-11-05',
        color: 'black',
        reminder: 360,
      },
    ]);
  });

  it('repeats on several weekdays every week', () => {
    const rule: IEventRule = {
      ...bins,
      startDate: '2026-11-02',
      interval: 1,
      weekdays: [1, 3],
    };

    expect(datesOf(rule, '2026-11-02', '2026-11-08')).toEqual(['2026-11-02', '2026-11-04']);
  });

  it('does not count weekdays before the start date in the first week', () => {
    const rule: IEventRule = { ...bins, startDate: '2026-11-04', weekdays: [1, 5] };

    expect(datesOf(rule, '2026-11-01', '2026-11-21')).toEqual([
      '2026-11-06',
      '2026-11-16',
      '2026-11-20',
    ]);
  });

  it('repeats every third day', () => {
    const rule: IEventRule = { ...bins, frequency: 'daily', interval: 3, startDate: '2026-11-01' };
    delete rule.weekdays;

    expect(datesOf(rule, '2026-11-01', '2026-11-10')).toEqual([
      '2026-11-01',
      '2026-11-04',
      '2026-11-07',
      '2026-11-10',
    ]);
  });

  it('skips months that lack the day for a monthly rule', () => {
    const rule: IEventRule = {
      ...bins,
      frequency: 'monthly',
      interval: 1,
      startDate: '2026-01-31',
    };
    delete rule.weekdays;

    expect(datesOf(rule, '2026-01-01', '2026-05-31')).toEqual([
      '2026-01-31',
      '2026-03-31',
      '2026-05-31',
    ]);
  });

  it('repeats every second month', () => {
    const rule: IEventRule = {
      ...bins,
      frequency: 'monthly',
      interval: 2,
      startDate: '2026-11-15',
    };
    delete rule.weekdays;

    expect(datesOf(rule, '2026-11-01', '2027-02-28')).toEqual(['2026-11-15', '2027-01-15']);
  });

  it('keeps the wall-clock time of a timed rule across the clock changes', () => {
    const rule: IEventRule = {
      ...bins,
      allDay: false,
      startTime: '18:00',
      endTime: '02:00',
      frequency: 'daily',
      interval: 1,
      startDate: '2026-10-24',
    };
    delete rule.weekdays;

    const [first, second] = expandRule({ rule, from: '2026-10-24', to: '2026-10-25' });

    expect(first).toMatchObject({
      startDate: '2026-10-24',
      endDate: '2026-10-25',
      startsAt: '2026-10-24T17:00:00Z',
      endsAt: '2026-10-25T02:00:00Z',
    });
    expect(second).toMatchObject({
      startsAt: '2026-10-25T18:00:00Z',
      endsAt: '2026-10-26T02:00:00Z',
    });
  });

  it('ends a timed occurrence on the same day when the end is later', () => {
    const rule: IEventRule = {
      ...bins,
      allDay: false,
      startTime: '09:00',
      endTime: '10:30',
      startDate: '2026-11-05',
    };

    expect(expandRule({ rule, from: '2026-11-05', to: '2026-11-05' })[0]).toMatchObject({
      endDate: '2026-11-05',
      startsAt: '2026-11-05T09:00:00Z',
      endsAt: '2026-11-05T10:30:00Z',
    });
  });
});
