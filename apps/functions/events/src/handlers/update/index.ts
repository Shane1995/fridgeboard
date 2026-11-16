import {
  deleteEventOp,
  getEvent,
  putEventOp,
} from '@fridgeboard/lambda-kit/repository/events/index.ts';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { isEventOwner } from '../../utils/isEventOwner/index.ts';
import { readBodyFields } from '../../utils/readBodyFields/index.ts';
import { readEventInput } from '../../utils/readEventInput/index.ts';

export const updateEvent = async ({ user, table, scope }: HouseholdRouteContext) => {
  const eventId = readPathParameter({ user, name: 'eventId' });
  const date = user.event.queryStringParameters?.date;
  if (!isCalendarDate(date)) {
    return jsonResponse(400, { reason: 'invalid-date' });
  }
  const current = await getEvent({ table, scope, startDate: date, eventId });
  if (current === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const fields = readBodyFields({ user });
  if (Object.keys(fields).length === 0) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }
  const input = readEventInput({ fields, current });
  if ('reason' in input) {
    return jsonResponse(400, { reason: input.reason });
  }
  if (
    input.event.ownerId !== current.ownerId &&
    !(await isEventOwner({ table, scope, ownerId: input.event.ownerId }))
  ) {
    return jsonResponse(400, { reason: 'invalid-owner' });
  }

  const event = { id: current.id, ...input.event };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: event.id }],
    items: [
      ...(event.startDate === current.startDate
        ? []
        : [deleteEventOp({ scope, startDate: current.startDate, eventId })]),
      putEventOp({ scope, event }),
    ],
  });
  return jsonResponse(200, event);
};
