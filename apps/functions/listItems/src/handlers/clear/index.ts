import { deleteItemOp, queryItems } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import { CLEAR_BY_ALL, CLEAR_BY_CHECKED, CLEAR_WRITES_LIMIT } from '../../constants.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';

export const clearListItems = async ({ user, table, scope }: ListRouteContext) => {
  const clearBy = user.event.queryStringParameters?.clearby;
  if (clearBy !== CLEAR_BY_ALL && clearBy !== CLEAR_BY_CHECKED) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }

  const items = await queryItems({ table, scope });
  const targets = clearBy === CLEAR_BY_ALL ? items : items.filter(({ checked }) => checked);
  if (targets.length === 0) {
    return { statusCode: 204 };
  }
  if (targets.length > CLEAR_WRITES_LIMIT) {
    return jsonResponse(409, { reason: 'too-many-items' });
  }

  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'item', id: scope.listId }],
    items: targets.map(({ id }) => deleteItemOp({ scope, itemId: id })),
  });
  return { statusCode: 204 };
};
