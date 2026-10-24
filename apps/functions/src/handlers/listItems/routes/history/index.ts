import { UNSORTED_SHOP_ID } from '@fridgeboard/contract/lists/constants';
import { shopIdsOf } from '../../../../utils/shopIdsOf/index.ts';
import { HistoryItemSchema } from '../../../../utils/items/historyItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { historyPrefix } from '../../../../utils/keys/historyPrefix/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';

export const listHistory = async ({ table, scope }: ListRouteContext) => {
  const entries = await table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${scope.householdId}`,
        ':prefix': historyPrefix(scope.listId),
      },
    },
    HistoryItemSchema,
  );
  return jsonResponse(200, {
    entries: entries
      .map(({ name, shopIds, shopId, count }) => {
        const shops = shopIdsOf({ shopIds, shopId });
        return { name, shopIds: shops, shopId: shops[0] ?? UNSORTED_SHOP_ID, count };
      })
      .sort((a, b) => b.count - a.count),
  });
};
