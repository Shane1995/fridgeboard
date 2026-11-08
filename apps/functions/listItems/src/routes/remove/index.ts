import { ListItemSchema } from '@fridgeboard/lambda-kit/utils/items/listItem/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { itemKey } from '@fridgeboard/lambda-kit/utils/keys/itemKey/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { ItemRouteOptions } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';

export const removeListItem = async ({ context: { table, scope }, itemId }: ItemRouteOptions) => {
  const key = itemKey({ ...scope, itemId });
  if ((await table.get(key, ListItemSchema)) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'item', id: itemId }],
    items: [{ delete: key }],
  });
  return { statusCode: 204 };
};
