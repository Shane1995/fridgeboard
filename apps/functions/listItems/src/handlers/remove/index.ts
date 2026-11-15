import { deleteItemOp, getItem } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';

export const removeListItem = async ({ user, table, scope }: ListRouteContext) => {
  const itemId = readPathParameter({ user, name: 'itemId' });
  if ((await getItem({ table, scope, itemId })) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'item', id: itemId }],
    items: [deleteItemOp({ scope, itemId })],
  });
  return { statusCode: 204 };
};
