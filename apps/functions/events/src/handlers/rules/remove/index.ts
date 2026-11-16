import { deleteRuleOp, getRule } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';

export const removeRule = async ({ user, table, scope }: HouseholdRouteContext) => {
  const ruleId = readPathParameter({ user, name: 'ruleId' });
  if ((await getRule({ table, scope, ruleId })) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: ruleId }],
    items: [deleteRuleOp({ scope, ruleId })],
  });
  return { statusCode: 204 };
};
