import { getRule, putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { expandRule } from '@fridgeboard/lambda-kit/utils/expandRule/index.ts';
import { isCalendarDate } from '@fridgeboard/lambda-kit/utils/isCalendarDate/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { RULE_SKIPS_MAX } from '../../../constants.ts';

export const skipOccurrence = async ({ user, table, scope }: HouseholdRouteContext) => {
  const ruleId = readPathParameter({ user, name: 'ruleId' });
  const date = readPathParameter({ user, name: 'date' });
  if (!isCalendarDate(date)) {
    return jsonResponse(400, { reason: 'invalid-date' });
  }
  const rule = await getRule({ table, scope, ruleId });
  if (rule === undefined || expandRule({ rule, from: date, to: date }).length === 0) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  if (rule.skip.length >= RULE_SKIPS_MAX) {
    return jsonResponse(409, { reason: 'too-many-skips' });
  }

  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: ruleId }],
    items: [putRuleOp({ scope, rule: { ...rule, skip: [...rule.skip, date].sort() } })],
  });
  return { statusCode: 204 };
};
