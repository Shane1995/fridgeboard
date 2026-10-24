import type { IShop } from '@fridgeboard/contract/lists';
import { ShopItemSchema } from '../../../../utils/items/shopItem/index.ts';
import { shopPrefix } from '../../../../utils/keys/shopPrefix/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../../../utils/keys/constants.ts';
import { toShop } from '../toShop/index.ts';
import type { QueryShopsOptions } from './types.ts';

export const queryShops = async ({
  table,
  scope: { householdId, listId },
}: QueryShopsOptions): Promise<IShop[]> =>
  (
    await table.query(
      {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `${HOUSEHOLD_PK_PREFIX}${householdId}`,
          ':prefix': shopPrefix(listId),
        },
      },
      ShopItemSchema,
    )
  )
    .map(toShop)
    .sort((a, b) => a.order - b.order);
