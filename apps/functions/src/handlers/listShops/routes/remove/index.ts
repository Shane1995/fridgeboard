import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { ShopItemSchema } from '../../../../utils/items/shopItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { shopKey } from '../../../../utils/keys/shopKey/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { itemPrefix } from '../../../../utils/keys/itemPrefix/index.ts';
import { recordChange } from '../../../../utils/recordChange/index.ts';
import type { ShopRouteOptions } from '../../../../utils/resolveList/types.ts';
import { REMOVE_WRITES_LIMIT } from '../../constants.ts';

export const removeListShop = async ({ context: { table, scope }, shopId }: ShopRouteOptions) => {
  const { householdId, listId } = scope;
  const key = shopKey({ householdId, listId, shopId });
  if ((await table.get(key, ShopItemSchema)) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const items = await table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
        ':prefix': itemPrefix(listId),
      },
    },
    ListItemSchema,
  );
  const inShop = items.filter((item) => (item.shopIds ?? []).includes(shopId));
  if (inShop.length > REMOVE_WRITES_LIMIT) {
    return jsonResponse(409, { reason: 'too-many-items' });
  }

  await recordChange({
    table,
    householdId,
    changes: [
      { type: 'shop', id: shopId },
      ...(inShop.length > 0 ? [{ type: 'item' as const, id: shopId }] : []),
    ],
    items: [
      ...inShop.map((item) => ({
        update: itemKey({ householdId, listId, itemId: item.id }),
        parts: { set: { shopIds: (item.shopIds ?? []).filter((id) => id !== shopId) } },
      })),
      { delete: key },
    ],
  });
  return { statusCode: 204 };
};
