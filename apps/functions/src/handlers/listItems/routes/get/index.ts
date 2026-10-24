import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import type { ItemRouteOptions } from '../../../../utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const getListItem = async ({ context: { table, scope }, itemId }: ItemRouteOptions) => {
  const item = await table.get(itemKey({ ...scope, itemId }), ListItemSchema);
  return item === undefined
    ? jsonResponse(404, { reason: 'not-found' })
    : jsonResponse(200, toListItem(item));
};
