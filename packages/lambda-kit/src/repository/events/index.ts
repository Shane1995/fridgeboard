import type { IEvent } from '@fridgeboard/contract/events';
import type * as z from 'zod/mini';
import { addDays } from '../../utils/addDays/index.ts';
import { compareEvents } from '../../utils/compareEvents/index.ts';
import { EventItemSchema } from '../../utils/items/eventItem/index.ts';
import { EVENT_SK_PREFIX, HOUSEHOLD_PK_PREFIX } from '../../utils/keys/constants.ts';
import { eventKey } from '../../utils/keys/eventKey/index.ts';
import type { TransactType } from '../../utils/table/types.ts';
import { EVENT_KEY_END_MARK, EVENT_MAX_SPAN_DAYS } from './constants.ts';
import type {
  DeleteEventOpOptions,
  GetEventOptions,
  PutEventOpOptions,
  QueryEventsOptions,
} from './types.ts';

const toEvent = (row: z.infer<typeof EventItemSchema>): IEvent => {
  const base = {
    id: row.id,
    title: row.title,
    note: row.note,
    ownerId: row.ownerId,
    eventType: 'event' as const,
    startDate: row.startDate,
    endDate: row.endDate,
    ...(row.color === undefined ? {} : { color: row.color }),
    ...(row.reminder === undefined ? {} : { reminder: row.reminder }),
  };
  return row.allDay
    ? { ...base, allDay: true }
    : { ...base, allDay: false, startsAt: row.startsAt ?? '', endsAt: row.endsAt ?? '' };
};

export const queryEvents = async ({
  table,
  scope: { householdId },
  from,
  to,
}: QueryEventsOptions): Promise<IEvent[]> =>
  (
    await table.query(
      {
        KeyConditionExpression: 'PK = :pk AND SK BETWEEN :lo AND :hi',
        ExpressionAttributeValues: {
          ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
          ':lo': `${EVENT_SK_PREFIX}${addDays({ date: from, days: -EVENT_MAX_SPAN_DAYS })}`,
          ':hi': `${EVENT_SK_PREFIX}${to}#${EVENT_KEY_END_MARK}`,
        },
      },
      EventItemSchema,
    )
  )
    .map(toEvent)
    .filter(({ endDate }) => endDate >= from)
    .sort(compareEvents);

export const getEvent = async ({
  table,
  scope,
  startDate,
  eventId,
}: GetEventOptions): Promise<IEvent | undefined> => {
  const row = await table.get(eventKey({ ...scope, startDate, eventId }), EventItemSchema);
  return row === undefined ? undefined : toEvent(row);
};

export const putEventOp = ({ scope, event }: PutEventOpOptions): TransactType => ({
  put: { ...eventKey({ ...scope, startDate: event.startDate, eventId: event.id }), ...event },
});

export const deleteEventOp = ({
  scope,
  startDate,
  eventId,
}: DeleteEventOpOptions): TransactType => ({
  delete: eventKey({ ...scope, startDate, eventId }),
});
