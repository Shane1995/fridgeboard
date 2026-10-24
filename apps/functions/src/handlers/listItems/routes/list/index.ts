import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { itemPrefix } from '../../../../utils/keys/itemPrefix/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const listListItems = async ({ table, scope }: ListRouteContext) => {
  const items = await table.query(
    {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `${HOUSEHOLD_PK_PREFIX}${scope.householdId}`,
        ':prefix': itemPrefix(scope.listId),
      },
    },
    ListItemSchema,
  );
  return jsonResponse(200, {
    items: items.map(toListItem).sort((a, b) => a.createdAt - b.createdAt),
  });
};
