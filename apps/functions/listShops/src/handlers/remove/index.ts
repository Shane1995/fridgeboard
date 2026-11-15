import { setItemShopsOp, queryItems } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { deleteShopOp, getShop } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { REMOVE_WRITES_LIMIT } from '../../constants.ts';

export const removeListShop = async ({ user, table, scope }: ListRouteContext) => {
  const shopId = readPathParameter({ user, name: 'shopId' });
  if ((await getShop({ table, scope, shopId })) === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const items = await queryItems({ table, scope });
  const inShop = items.filter((item) => (item.shopIds ?? []).includes(shopId));
  if (inShop.length > REMOVE_WRITES_LIMIT) {
    return jsonResponse(409, { reason: 'too-many-items' });
  }

  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [
      { type: 'shop', id: shopId },
      ...(inShop.length > 0 ? [{ type: 'item' as const, id: shopId }] : []),
    ],
    items: [
      ...inShop.map((item) =>
        setItemShopsOp({
          scope,
          itemId: item.id,
          shopIds: (item.shopIds ?? []).filter((id) => id !== shopId),
        }),
      ),
      deleteShopOp({ scope, shopId }),
    ],
  });
  return { statusCode: 204 };
};
