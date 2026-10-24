import { LIST_ITEM_NAME_MAX_LENGTH, UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import type { IListItem } from '@fridgeboard/contract/lists';
import { shopExists } from '../../../../utils/shopExists/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { historyKey } from '../../../../utils/keys/historyKey/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { newId } from '../../../../utils/newId/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';

export const createListItem = async ({ user, table, scope }: ListRouteContext) => {
  const body = readJsonBody(user.event);
  const { name: rawName, shopId: rawShopId = UNSORTED_SHOP_ID } =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = readText({ value: rawName, maxLength: LIST_ITEM_NAME_MAX_LENGTH });
  if (name === undefined) {
    return jsonResponse(400, { reason: 'invalid-name' });
  }
  if (typeof rawShopId !== 'string' || !(await shopExists({ table, scope, shopId: rawShopId }))) {
    return jsonResponse(400, { reason: 'invalid-shop' });
  }

  const item: IListItem = {
    id: newId(),
    name,
    shopId: rawShopId,
    checked: false,
    createdAt: Date.now(),
    addedBy: user.sub,
  };
  await table.transactWrite([
    { put: { ...itemKey({ ...scope, itemId: item.id }), ...item } },
    {
      update: historyKey({ ...scope, name }),
      parts: { set: { name, shopId: item.shopId }, add: { count: 1 } },
    },
  ]);
  return jsonResponse(201, item);
};
