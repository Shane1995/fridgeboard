import { putEventOp } from '@fridgeboard/lambda-kit/repository/events/index.ts';
import { getRule, putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { expandRule } from '@fridgeboard/lambda-kit/utils/expandRule/index.ts';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { newId } from '@fridgeboard/lambda-kit/utils/newId/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { RULE_SKIPS_MAX } from '../../../constants.ts';
import { isEventOwner } from '../../../utils/isEventOwner/index.ts';
import { readBodyFields } from '../../../utils/readBodyFields/index.ts';
import { readEventInput } from '../../../utils/readEventInput/index.ts';

// Turns one date of a rule into an event of its own, with the fields in the body changed, and
// skips that date in the rule.
export const overrideOccurrence = async ({ user, table, scope }: HouseholdRouteContext) => {
  const ruleId = readPathParameter({ user, name: 'ruleId' });
  const date = readPathParameter({ user, name: 'date' });
  if (!isCalendarDate(date)) {
    return jsonResponse(400, { reason: 'invalid-date' });
  }
  const rule = await getRule({ table, scope, ruleId });
  const occurrence = rule && expandRule({ rule, from: date, to: date })[0];
  if (rule === undefined || occurrence === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  if (rule.skip.length >= RULE_SKIPS_MAX) {
    return jsonResponse(409, { reason: 'too-many-skips' });
  }

  const input = readEventInput({ fields: readBodyFields({ user }), current: occurrence });
  if ('reason' in input) {
    return jsonResponse(400, { reason: input.reason });
  }
  if (
    input.event.ownerId !== occurrence.ownerId &&
    !(await isEventOwner({ table, scope, ownerId: input.event.ownerId }))
  ) {
    return jsonResponse(400, { reason: 'invalid-owner' });
  }

  const event = { id: newId(), ...input.event };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: event.id }],
    items: [
      putEventOp({ scope, event }),
      putRuleOp({ scope, rule: { ...rule, skip: [...rule.skip, date].sort() } }),
    ],
  });
  return jsonResponse(201, event);
};
