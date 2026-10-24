import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const getListItem = async ({ table, scope }: ListRouteContext, itemId: string) => {
  const item = await table.get(itemKey(scope.householdId, scope.listId, itemId), ListItemSchema);
  return item === undefined
    ? jsonResponse(404, { reason: 'not-found' })
    : jsonResponse(200, toListItem(item));
};
