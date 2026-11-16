import type { IEventRule } from '@fridgeboard/contract/events';
import { readRuleInput } from './index.ts';

const bins = {
  title: ' General waste ',
  ownerId: 'household',
  allDay: true,
  startDate: '2026-11-05',
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  color: 'black',
  reminder: 360,
};

const current: IEventRule = {
  id: 'r-1',
  title: 'Recycling',
  note: '',
  ownerId: 'household',
  allDay: true,
  startDate: '2026-11-12',
  frequency: 'weekly',
  interval: 2,
  weekdays: [4],
  skip: ['2026-11-26'],
};

describe('readRuleInput', () => {
  it('accepts a bin-day rule', () => {
    expect(readRuleInput({ fields: bins })).toEqual({
      rule: {
        title: 'General waste',
        note: '',
        ownerId: 'household',
        allDay: true,
        startDate: '2026-11-05',
        frequency: 'weekly',
        interval: 2,
        weekdays: [4],
        color: 'black',
        reminder: 360,
      },
    });
  });

  it('repeats every week on the start weekday when nothing else is said', () => {
    const fields = { ...bins, interval: undefined, weekdays: undefined };

    expect(readRuleInput({ fields })).toMatchObject({
      rule: { interval: 1, weekdays: [4] },
    });
  });

  it('sorts and de-duplicates the weekdays', () => {
    expect(readRuleInput({ fields: { ...bins, weekdays: [5, 1, 5] } })).toMatchObject({
      rule: { weekdays: [1, 5] },
    });
  });

  it.each(['daily', 'monthly'])('leaves weekdays out of a %s rule', (frequency) => {
    const result = readRuleInput({ fields: { ...bins, frequency } });

    expect(result).toHaveProperty('rule');
    expect(result).not.toHaveProperty('rule.weekdays');
  });

  it.each([0, 53, 1.5, '2'])('refuses the interval %j', (interval) => {
    expect(readRuleInput({ fields: { ...bins, interval } })).toEqual({ reason: 'invalid-rule' });
  });

  it.each(['yearly', 3, undefined])('refuses the frequency %j', (frequency) => {
    expect(readRuleInput({ fields: { ...bins, frequency } })).toEqual({ reason: 'invalid-rule' });
  });

  it.each([[[]], [[7]], [[-1]], ['4'], [[1.5]]])('refuses the weekdays %j', (weekdays) => {
    expect(readRuleInput({ fields: { ...bins, weekdays } })).toEqual({ reason: 'invalid-rule' });
  });

  it('refuses a start date that is not a date', () => {
    expect(readRuleInput({ fields: { ...bins, startDate: '2026-02-30' } })).toEqual({
      reason: 'invalid-date',
    });
  });

  it('keeps an until date on or after the start and refuses one before it', () => {
    expect(readRuleInput({ fields: { ...bins, until: '2026-11-05' } })).toMatchObject({
      rule: { until: '2026-11-05' },
    });
    expect(readRuleInput({ fields: { ...bins, until: '2026-11-04' } })).toEqual({
      reason: 'invalid-date',
    });
  });

  it('needs valid times for a timed rule', () => {
    const timed = { ...bins, allDay: false, startTime: '18:00', endTime: '02:00' };

    expect(readRuleInput({ fields: timed })).toMatchObject({
      rule: { allDay: false, startTime: '18:00', endTime: '02:00' },
    });
    expect(readRuleInput({ fields: { ...timed, startTime: '9:00' } })).toEqual({
      reason: 'invalid-time',
    });
    expect(readRuleInput({ fields: { ...timed, endTime: '24:00' } })).toEqual({
      reason: 'invalid-time',
    });
    expect(readRuleInput({ fields: { ...bins, allDay: false } })).toEqual({
      reason: 'invalid-time',
    });
  });

  it('refuses a bad title, owner, colour or reminder', () => {
    expect(readRuleInput({ fields: { ...bins, title: ' ' } })).toEqual({ reason: 'invalid-title' });
    expect(readRuleInput({ fields: { ...bins, ownerId: 'a#b' } })).toEqual({
      reason: 'invalid-owner',
    });
    expect(readRuleInput({ fields: { ...bins, color: 'beige' } })).toEqual({
      reason: 'invalid-color',
    });
    expect(readRuleInput({ fields: { ...bins, reminder: -5 } })).toEqual({
      reason: 'invalid-reminder',
    });
  });

  it('refuses a body that does not say whether it is all day', () => {
    expect(readRuleInput({ fields: { ...bins, allDay: undefined } })).toEqual({
      reason: 'invalid-request',
    });
  });

  it('keeps every other current field when a patch sends only the title', () => {
    expect(readRuleInput({ fields: { title: 'Paper' }, current })).toEqual({
      rule: {
        title: 'Paper',
        note: '',
        ownerId: 'household',
        allDay: true,
        startDate: '2026-11-12',
        frequency: 'weekly',
        interval: 2,
        weekdays: [4],
      },
    });
  });

  it('drops the weekdays when a patch makes the rule monthly', () => {
    const result = readRuleInput({ fields: { frequency: 'monthly' }, current });

    expect(result).toHaveProperty('rule.frequency', 'monthly');
    expect(result).not.toHaveProperty('rule.weekdays');
  });

  it('clears until with null', () => {
    const ending: IEventRule = { ...current, until: '2027-01-01' };

    const result = readRuleInput({ fields: { until: null }, current: ending });

    expect(result).toHaveProperty('rule.startDate', '2026-11-12');
    expect(result).not.toHaveProperty('rule.until');
  });

  it('asks for times when a patch makes an all-day rule timed', () => {
    expect(readRuleInput({ fields: { allDay: false }, current })).toEqual({
      reason: 'invalid-time',
    });
  });
});
