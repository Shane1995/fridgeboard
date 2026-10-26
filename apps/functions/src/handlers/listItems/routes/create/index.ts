import { LIST_ITEM_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { historyKey } from '../../../../utils/keys/historyKey/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { newId } from '../../../../utils/newId/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readShopIds } from '../../../../utils/readShopIds/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import { recordChange } from '../../../../utils/recordChange/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const createListItem = async ({ user, table, scope }: ListRouteContext) => {
  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = readText({ value: fields.name, maxLength: LIST_ITEM_NAME_MAX_LENGTH });
  if (name === undefined) {
    return jsonResponse(400, { reason: 'invalid-name' });
  }
  const shops = await readShopIds({ fields, table, scope });
  if (shops.status === 'invalid') {
    return jsonResponse(400, { reason: 'invalid-shop' });
  }
  const shopIds = shops.status === 'ok' ? shops.shopIds : [];

  const stored = {
    id: newId(),
    name,
    shopIds,
    checked: false,
    createdAt: Date.now(),
    addedBy: user.sub,
  };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'item', id: stored.id }],
    items: [
      { put: { ...itemKey({ ...scope, itemId: stored.id }), ...stored } },
      {
        update: historyKey({ ...scope, name }),
        parts: { set: { name, shopIds }, add: { count: 1 } },
      },
    ],
  });
  return jsonResponse(201, toListItem(stored));
};
