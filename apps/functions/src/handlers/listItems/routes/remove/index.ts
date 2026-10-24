import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import type { ItemRouteOptions } from '../../../../utils/resolveList/types.ts';

export const removeListItem = async ({ context: { table, scope }, itemId }: ItemRouteOptions) =>
  (await table.remove(itemKey({ ...scope, itemId })))
    ? { statusCode: 204 }
    : jsonResponse(404, { reason: 'not-found' });
