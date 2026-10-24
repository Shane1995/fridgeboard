import { UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { shopKey } from '../../../../utils/keys/shopKey/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { itemPrefix } from '../../../../utils/keys/itemPrefix/index.ts';
import type { ShopRouteOptions } from '../../../../utils/resolveList/types.ts';

export const removeListShop = async ({ context: { table, scope }, shopId }: ShopRouteOptions) => {
  const { householdId, listId } = scope;
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
  await Promise.all(
    items
      .filter((item) => item.shopId === shopId)
      .map((item) =>
        table.update({
          key: itemKey({ householdId, listId, itemId: item.id }),
          parts: { set: { shopId: UNSORTED_SHOP_ID } },
          schema: ListItemSchema,
        }),
      ),
  );
  return (await table.remove(shopKey({ householdId, listId, shopId })))
    ? { statusCode: 204 }
    : jsonResponse(404, { reason: 'not-found' });
};
