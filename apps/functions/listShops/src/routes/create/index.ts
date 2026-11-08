import { SHOP_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import type { IShop } from '@fridgeboard/contract/lists';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { shopKey } from '@fridgeboard/lambda-kit/utils/keys/shopKey/index.ts';
import { newId } from '@fridgeboard/lambda-kit/utils/newId/index.ts';
import { readJsonBody } from '@fridgeboard/lambda-kit/utils/readJsonBody/index.ts';
import { readText } from '@fridgeboard/lambda-kit/utils/readText/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { queryShops } from '../../utils/queryShops/index.ts';
import { readColor } from '../../utils/readColor/index.ts';

export const createListShop = async ({ user, table, scope }: ListRouteContext) => {
  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = readText({ value: fields.name, maxLength: SHOP_NAME_MAX_LENGTH });
  if (name === undefined) {
    return jsonResponse(400, { reason: 'invalid-name' });
  }
  const color = readColor(fields.color);
  if (color === undefined) {
    return jsonResponse(400, { reason: 'invalid-color' });
  }

  const existing = await queryShops({ table, scope });
  const order = existing.reduce((highest, shop) => Math.max(highest, shop.order), -1) + 1;
  const shop: IShop = { id: newId(), name, color, order };
  await recordChange({
    table,
    householdId: scope.householdId,
    changes: [{ type: 'shop', id: shop.id }],
    items: [{ put: { ...shopKey({ ...scope, shopId: shop.id }), ...shop } }],
  });
  return jsonResponse(201, shop);
};
