import { deleteEventOp, getEvent } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';

export const removeEvent = async ({ user, table, scope }: HouseholdRouteContext) => {
  const eventId = readPathParameter({ user, name: 'eventId' });
  const date = user.event.queryStringParameters?.date;
  if (!isCalendarDate(date)) {
    return jsonResponse(400, { reason: 'invalid-date' });
  }
  if ((await getEvent({ table, scope, startDate: date, eventId })) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: eventId }],
    items: [deleteEventOp({ scope, startDate: date, eventId })],
  });
  return { statusCode: 204 };
};
