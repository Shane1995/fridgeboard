import { UNSORTED_BUCKET_ID } from '@fridgeboard/contract/lists/constants';
import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { bucketKey } from '../../../../utils/keys/bucketKey/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { itemPrefix } from '../../../../utils/keys/itemPrefix/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';

export const removeListBucket = async ({ table, scope }: ListRouteContext, bucketId: string) => {
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
      .filter((item) => item.bucketId === bucketId)
      .map((item) =>
        table.update(
          itemKey(householdId, listId, item.id),
          { set: { bucketId: UNSORTED_BUCKET_ID } },
          ListItemSchema,
        ),
      ),
  );
  return (await table.remove(bucketKey(householdId, listId, bucketId)))
    ? { statusCode: 204 }
    : jsonResponse(404, { reason: 'not-found' });
};
