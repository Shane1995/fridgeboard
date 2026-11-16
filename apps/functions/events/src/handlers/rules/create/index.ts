import { putRuleOp, queryRules } from '@fridgeboard/lambda-kit/repository/rules/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { newId } from '@fridgeboard/lambda-kit/utils/newId/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { HouseholdRouteContext } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import { RULES_MAX_PER_HOUSEHOLD } from '../../../constants.ts';
import { isEventOwner } from '../../../utils/isEventOwner/index.ts';
import { readBodyFields } from '../../../utils/readBodyFields/index.ts';
import { readRuleInput } from '../../../utils/readRuleInput/index.ts';

export const createRule = async ({ user, table, scope }: HouseholdRouteContext) => {
  const input = readRuleInput({ fields: readBodyFields({ user }) });
  if ('reason' in input) {
    return jsonResponse(400, { reason: input.reason });
  }
  if ((await queryRules({ table, scope })).length >= RULES_MAX_PER_HOUSEHOLD) {
    return jsonResponse(409, { reason: 'too-many-rules' });
  }
  if (!(await isEventOwner({ table, scope, ownerId: input.rule.ownerId }))) {
    return jsonResponse(400, { reason: 'invalid-owner' });
  }

  const rule = { id: newId(), ...input.rule, skip: [] };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'event', id: rule.id }],
    items: [putRuleOp({ scope, rule })],
  });
  return jsonResponse(201, rule);
};
