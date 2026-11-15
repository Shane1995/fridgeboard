import { LIST_ITEM_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { countHistoryOp } from '@fridgeboard/lambda-kit/repository/history/index.ts';
import { putItemOp } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { queryShops } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { newId } from '@fridgeboard/lambda-kit/utils/newId/index.ts';
import { readJsonBody } from '@fridgeboard/lambda-kit/utils/readJsonBody/index.ts';
import { readShopIds } from '../../utils/readShopIds/index.ts';
import { readText } from '@fridgeboard/lambda-kit/utils/readText/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
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
    items: [putItemOp({ scope, item: stored }), countHistoryOp({ scope, name, shopIds })],
  });
  return jsonResponse(201, toListItem({ row: stored, shops: await queryShops({ table, scope }) }));
};
