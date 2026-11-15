import type { IShop, ShopColorName } from '@fridgeboard/contract/lists';
import type * as z from 'zod/mini';
import { ShopItemSchema } from '../../utils/items/shopItem/index.ts';
import { HOUSEHOLD_PK_PREFIX } from '../../utils/keys/constants.ts';
import { shopKey } from '../../utils/keys/shopKey/index.ts';
import { shopPrefix } from '../../utils/keys/shopPrefix/index.ts';
import type { TransactType } from '../../utils/table/types.ts';
import { EXISTS_CONDITION } from '../constants.ts';
import type {
  GetShopOptions,
  PutShopOpOptions,
  QueryShopsOptions,
  SetShopOrderOpOptions,
  ShopOpOptions,
  UpdateShopOpOptions,
} from './types.ts';

export const toShop = ({ id, name, color, order }: z.infer<typeof ShopItemSchema>): IShop => ({
  id,
  name,
  color: color as ShopColorName,
  order,
});

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

export const getShop = ({ table, scope, shopId }: GetShopOptions) =>
  table.get(shopKey({ ...scope, shopId }), ShopItemSchema);

export const putShopOp = ({ scope, shop }: PutShopOpOptions): TransactType => ({
  put: { ...shopKey({ ...scope, shopId: shop.id }), ...shop },
});

export const updateShopOp = ({ scope, shopId, set }: UpdateShopOpOptions): TransactType => ({
  update: shopKey({ ...scope, shopId }),
  parts: { set },
  condition: { expression: EXISTS_CONDITION },
});

export const setShopOrderOp = ({ scope, shopId, order }: SetShopOrderOpOptions): TransactType => ({
  update: shopKey({ ...scope, shopId }),
  parts: { set: { order } },
});

export const deleteShopOp = ({ scope, shopId }: ShopOpOptions): TransactType => ({
  delete: shopKey({ ...scope, shopId }),
});
