import type { IEvent } from '@fridgeboard/contract/events';
import { addDays } from '../addDays/index.ts';
import { daysBetween } from '../daysBetween/index.ts';
import { londonLocalToInstant } from '../londonLocalToInstant/index.ts';
import type { ExpandRuleOptions, MatchesRuleOptions } from './types.ts';

const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;

const weekdayOf = (date: string): number => new Date(`${date}T00:00:00Z`).getUTCDay();

const weekStartOf = (date: string): string => addDays({ date, days: -weekdayOf(date) });

const monthsBetween = ({ from, to }: { from: string; to: string }): number =>
  (Number(to.slice(0, 4)) - Number(from.slice(0, 4))) * MONTHS_PER_YEAR +
  Number(to.slice(5, 7)) -
  Number(from.slice(5, 7));

const matches = ({ rule, date }: MatchesRuleOptions): boolean => {
  if (rule.skip.includes(date)) {
    return false;
  }
  switch (rule.frequency) {
    case 'daily':
      return daysBetween({ from: rule.startDate, to: date }) % rule.interval === 0;
    case 'weekly': {
      const weeks =
        daysBetween({ from: weekStartOf(rule.startDate), to: weekStartOf(date) }) / DAYS_PER_WEEK;
      return (
        weeks % rule.interval === 0 &&
        (rule.weekdays ?? [weekdayOf(rule.startDate)]).includes(weekdayOf(date))
      );
    }
    case 'monthly':
      return (
        date.slice(8) === rule.startDate.slice(8) &&
        monthsBetween({ from: rule.startDate, to: date }) % rule.interval === 0
      );
  }
};

const occurrenceOn = ({ rule, date }: MatchesRuleOptions): IEvent => {
  const base = {
    id: `${rule.id}_${date}`,
    ruleId: rule.id,
    title: rule.title,
    note: rule.note,
    ownerId: rule.ownerId,
    eventType: 'event' as const,
    startDate: date,
    ...(rule.color === undefined ? {} : { color: rule.color }),
    ...(rule.reminder === undefined ? {} : { reminder: rule.reminder }),
  };
  if (rule.allDay) {
    return { ...base, allDay: true, endDate: date };
  }
  const endDate = rule.endTime <= rule.startTime ? addDays({ date, days: 1 }) : date;
  return {
    ...base,
    allDay: false,
    endDate,
    startsAt: londonLocalToInstant({ date, time: rule.startTime }),
    endsAt: londonLocalToInstant({ date: endDate, time: rule.endTime }),
  };
};

// The occurrences of a rule that start inside the window, both ends included. Callers cap the
// window (the events Lambda allows 62 days), which bounds the loop.
export const expandRule = ({ rule, from, to }: ExpandRuleOptions): IEvent[] => {
  const last = rule.until !== undefined && rule.until < to ? rule.until : to;
  const occurrences: IEvent[] = [];
  for (
    let date = rule.startDate > from ? rule.startDate : from;
    date <= last;
    date = addDays({ date, days: 1 })
  ) {
    if (matches({ rule, date })) {
      occurrences.push(occurrenceOn({ rule, date }));
    }
  }
  return occurrences;
};
