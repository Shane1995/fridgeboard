import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';

export const removeListItem = async ({ table, scope }: ListRouteContext, itemId: string) =>
  (await table.remove(itemKey(scope.householdId, scope.listId, itemId)))
    ? { statusCode: 204 }
    : jsonResponse(404, { reason: 'not-found' });
