import { getRule, putRuleOp } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { isEventOwner } from '../../../utils/isEventOwner/index.ts';
import { readBodyFields } from '../../../utils/readBodyFields/index.ts';
import { readRuleInput } from '../../../utils/readRuleInput/index.ts';

export const updateRule = async ({ user, table, scope }: HouseholdRouteContext) => {
  const ruleId = readPathParameter({ user, name: 'ruleId' });
  const current = await getRule({ table, scope, ruleId });
  if (current === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const fields = readBodyFields({ user });
  if (Object.keys(fields).length === 0) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }
  const input = readRuleInput({ fields, current });
  if ('reason' in input) {
    return jsonResponse(400, { reason: input.reason });
  }
  if (
    input.rule.ownerId !== current.ownerId &&
    !(await isEventOwner({ table, scope, ownerId: input.rule.ownerId }))
  ) {
    return jsonResponse(400, { reason: 'invalid-owner' });
  }

  const rule = { id: current.id, ...input.rule, skip: current.skip };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: rule.id }],
    items: [putRuleOp({ scope, rule })],
  });
  return jsonResponse(200, rule);
};
