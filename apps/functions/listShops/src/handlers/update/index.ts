import { SHOP_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { isConditionFailedAt } from '@fridgeboard/lambda-kit/utils/isConditionFailedAt/index.ts';
import { getShop, toShop, updateShopOp } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readJsonBody } from '@fridgeboard/lambda-kit/utils/readJsonBody/index.ts';
import { readText } from '@fridgeboard/lambda-kit/utils/readText/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { readColor } from '../../utils/readColor/index.ts';
import type { ShopChanges } from './types.ts';

export const updateListShop = async ({ user, table, scope }: ListRouteContext) => {
  const shopId = readPathParameter({ user, name: 'shopId' });
  const current = await getShop({ table, scope, shopId });
  if (current === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const set: ShopChanges = {};

  if ('name' in fields) {
    const name = readText({ value: fields.name, maxLength: SHOP_NAME_MAX_LENGTH });
    if (name === undefined) {
      return jsonResponse(400, { reason: 'invalid-name' });
    }
    set.name = name;
  }
  if ('color' in fields) {
    const color = readColor(fields.color);
    if (color === undefined) {
      return jsonResponse(400, { reason: 'invalid-color' });
    }
    set.color = color;
  }
  if (Object.keys(set).length === 0) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }

  try {
    await recordChange({
      table,
      householdId: scope.householdId,
      changes: [{ type: 'shop', id: shopId }],
      items: [updateShopOp({ scope, shopId, set })],
    });
  } catch (error) {
    if (isConditionFailedAt({ error, index: 0 })) {
      return jsonResponse(404, { reason: 'not-found' });
    }
    throw error;
  }
  return jsonResponse(200, toShop({ ...current, ...set }));
};
