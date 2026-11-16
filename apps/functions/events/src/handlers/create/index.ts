import { putEventOp } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { newId } from '@fridgeboard/lambda-kit/utils/newId/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { isEventOwner } from '../../utils/isEventOwner/index.ts';
import { readBodyFields } from '../../utils/readBodyFields/index.ts';
import { readEventInput } from '../../utils/readEventInput/index.ts';

export const createEvent = async ({ user, table, scope }: HouseholdRouteContext) => {
  const input = readEventInput({ fields: readBodyFields({ user }) });
  if ('reason' in input) {
    return jsonResponse(400, { reason: input.reason });
  }
  if (!(await isEventOwner({ table, scope, ownerId: input.event.ownerId }))) {
    return jsonResponse(400, { reason: 'invalid-owner' });
  }

  const event = { id: newId(), ...input.event };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: event.id }],
    items: [putEventOp({ scope, event })],
  });
  return jsonResponse(201, event);
};
