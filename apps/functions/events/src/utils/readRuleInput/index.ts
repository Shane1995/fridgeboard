import type {
  IEventErrorReason,
  IEventRule,
  IEventRuleBase,
  IEventRuleFrequency,
} from '@fridgeboard/contract/events';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import {
  RULE_FREQUENCIES,
  RULE_INTERVAL_MAX,
  RULE_TIME_PATTERN,
  WEEKDAY_MAX,
} from '../../constants.ts';
import { readEventBasics } from '../readEventBasics/index.ts';
import type { ReadRuleInputOptions, ReadRuleInputResult } from './types.ts';

type RuleRepeat = Pick<
  IEventRuleBase,
  'startDate' | 'frequency' | 'interval' | 'weekdays' | 'until'
>;

const isFrequency = (value: unknown): value is IEventRuleFrequency =>
  RULE_FREQUENCIES.includes(value as IEventRuleFrequency);

const isTime = (value: unknown): value is string =>
  typeof value === 'string' && RULE_TIME_PATTERN.test(value);

const readWeekdays = (value: unknown): number[] | undefined =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((day) => Number.isInteger(day) && day >= 0 && day <= WEEKDAY_MAX)
    ? [...new Set<number>(value)].sort((a, b) => a - b)
    : undefined;

const carriedFields = (current: IEventRule): Record<string, unknown> => ({
  startDate: current.startDate,
  frequency: current.frequency,
  interval: current.interval,
  weekdays: current.weekdays,
  until: current.until,
  ...(current.allDay ? {} : { startTime: current.startTime, endTime: current.endTime }),
});

const isInterval = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= RULE_INTERVAL_MAX;

const isUntil = ({ until, startDate }: { until: unknown; startDate: string }): boolean =>
  until === undefined || until === null || (isCalendarDate(until) && until >= startDate);

const defaultWeekdays = ({ startDate }: { startDate: string }): number[] => [
  new Date(`${startDate}T00:00:00Z`).getUTCDay(),
];

const readRepeatDays = ({
  frequency,
  weekdays,
  startDate,
}: {
  frequency: IEventRuleFrequency;
  weekdays: unknown;
  startDate: string;
}): { weekdays?: number[] } | undefined => {
  if (frequency !== 'weekly') {
    return {};
  }
  const read = readWeekdays(weekdays ?? defaultWeekdays({ startDate }));
  return read === undefined ? undefined : { weekdays: read };
};

const readRepeat = ({
  merged,
}: {
  merged: Record<string, unknown>;
}): { repeat: RuleRepeat } | { reason: IEventErrorReason } => {
  const { startDate, frequency, until } = merged;
  if (!isCalendarDate(startDate)) {
    return { reason: 'invalid-date' };
  }
  const interval = merged.interval ?? 1;
  if (!isFrequency(frequency) || !isInterval(interval)) {
    return { reason: 'invalid-rule' };
  }
  if (!isUntil({ until, startDate })) {
    return { reason: 'invalid-date' };
  }
  const days = readRepeatDays({ frequency, weekdays: merged.weekdays, startDate });
  if (days === undefined) {
    return { reason: 'invalid-rule' };
  }
  return {
    repeat: {
      startDate,
      frequency,
      interval,
      ...days,
      ...(isCalendarDate(until) ? { until } : {}),
    },
  };
};

export const readRuleInput = ({ fields, current }: ReadRuleInputOptions): ReadRuleInputResult => {
  const allDay = fields.allDay ?? current?.allDay;
  if (typeof allDay !== 'boolean') {
    return { reason: 'invalid-request' };
  }
  const sameKind = current !== undefined && current.allDay === allDay;
  const merged: Record<string, unknown> = {
    title: current?.title,
    note: current?.note,
    ownerId: current?.ownerId,
    color: current?.color,
    reminder: current?.reminder,
    ...(current === undefined ? {} : carriedFields(current)),
    ...(sameKind ? {} : { startTime: undefined, endTime: undefined }),
    ...fields,
  };

  const read = readEventBasics({ merged });
  if ('reason' in read) {
    return { reason: read.reason };
  }
  const readRepeatResult = readRepeat({ merged });
  if ('reason' in readRepeatResult) {
    return { reason: readRepeatResult.reason };
  }
  const base = { ...read.basics, ...readRepeatResult.repeat };
  if (allDay) {
    return { rule: { ...base, allDay: true } };
  }
  const { startTime, endTime } = merged;
  return isTime(startTime) && isTime(endTime)
    ? { rule: { ...base, allDay: false, startTime, endTime } }
    : { reason: 'invalid-time' };
};
