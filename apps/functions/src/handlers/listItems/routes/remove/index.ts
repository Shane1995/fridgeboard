import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { recordChange } from '../../../../utils/recordChange/index.ts';
import type { ItemRouteOptions } from '../../../../utils/resolveList/types.ts';

export const removeListItem = async ({ context: { table, scope }, itemId }: ItemRouteOptions) => {
  const key = itemKey({ ...scope, itemId });
  if ((await table.get(key, ListItemSchema)) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  await recordChange({
    table,
    householdId: scope.householdId,
    type: 'item',
    id: itemId,
    items: [{ delete: key }],
  });
  return { statusCode: 204 };
};
