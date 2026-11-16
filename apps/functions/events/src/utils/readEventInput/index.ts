import { EVENT_MAX_SPAN_DAYS } from '@fridgeboard/lambda-kit/repository/events/constants.ts';
import { daysBetween } from '@fridgeboard/lambda-kit/utils/daysBetween/index.ts';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import type { IEvent } from '@fridgeboard/contract/events';
import { ISO_UTC_INSTANT_PATTERN } from '../../constants.ts';
import { readEventBasics } from '../readEventBasics/index.ts';
import { toLondonDate } from '../toLondonDate/index.ts';
import type { EventBasics } from '../readEventBasics/types.ts';
import type { ReadEventInputOptions, ReadEventInputResult } from './types.ts';

const carriedFields = (current: IEvent): Record<string, unknown> =>
  current.allDay
    ? { startDate: current.startDate, endDate: current.endDate }
    : { startsAt: current.startsAt, endsAt: current.endsAt };

const readInstant = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !ISO_UTC_INSTANT_PATTERN.test(value)) {
    return undefined;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : new Date(time).toISOString().replace('.000Z', 'Z');
};

type EventBase = EventBasics & { eventType: 'event' };

const readAllDay = ({
  merged,
  base,
}: {
  merged: Record<string, unknown>;
  base: EventBase;
}): ReadEventInputResult => {
  const { startDate, endDate } = merged;
  if (!isCalendarDate(startDate) || !isCalendarDate(endDate) || endDate < startDate) {
    return { reason: 'invalid-date' };
  }
  return daysBetween({ from: startDate, to: endDate }) > EVENT_MAX_SPAN_DAYS
    ? { reason: 'invalid-range' }
    : { event: { ...base, allDay: true, startDate, endDate } };
};

const readTimed = ({
  merged,
  base,
}: {
  merged: Record<string, unknown>;
  base: EventBase;
}): ReadEventInputResult => {
  const startsAt = readInstant(merged.startsAt);
  const endsAt = readInstant(merged.endsAt);
  if (startsAt === undefined || endsAt === undefined) {
    return { reason: 'invalid-time' };
  }
  const startDate = toLondonDate({ instant: startsAt });
  const endDate = toLondonDate({ instant: endsAt });
  if (
    startDate === undefined ||
    endDate === undefined ||
    Date.parse(endsAt) < Date.parse(startsAt)
  ) {
    return { reason: 'invalid-time' };
  }
  return daysBetween({ from: startDate, to: endDate }) > EVENT_MAX_SPAN_DAYS
    ? { reason: 'invalid-range' }
    : { event: { ...base, allDay: false, startDate, endDate, startsAt, endsAt } };
};

export const readEventInput = ({
  fields,
  current,
}: ReadEventInputOptions): ReadEventInputResult => {
  const allDay = fields.allDay ?? current?.allDay;
  if (typeof allDay !== 'boolean') {
    return { reason: 'invalid-request' };
  }
  const merged: Record<string, unknown> = {
    title: current?.title,
    note: current?.note,
    ownerId: current?.ownerId,
    color: current?.color,
    reminder: current?.reminder,
    ...(current !== undefined && current.allDay === allDay ? carriedFields(current) : {}),
    ...fields,
  };

  const read = readEventBasics({ merged });
  if ('reason' in read) {
    return { reason: read.reason };
  }
  const base = { ...read.basics, eventType: 'event' as const };
  return allDay ? readAllDay({ merged, base }) : readTimed({ merged, base });
};
