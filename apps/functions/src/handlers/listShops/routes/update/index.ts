import { SHOP_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { isConditionFailedAt } from '../../../../utils/isConditionFailedAt/index.ts';
import { ShopItemSchema } from '../../../../utils/items/shopItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { shopKey } from '../../../../utils/keys/shopKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import { recordChange } from '../../../../utils/recordChange/index.ts';
import type { ShopRouteOptions } from '../../../../utils/resolveList/types.ts';
import { EXISTS_CONDITION } from '../../constants.ts';
import { readColor } from '../../utils/readColor/index.ts';
import { toShop } from '../../utils/toShop/index.ts';
import type { ShopChanges } from './types.ts';

export const updateListShop = async ({
  context: { user, table, scope },
  shopId,
}: ShopRouteOptions) => {
  const key = shopKey({ ...scope, shopId });
  const current = await table.get(key, ShopItemSchema);
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
      items: [{ update: key, parts: { set }, condition: { expression: EXISTS_CONDITION } }],
    });
  } catch (error) {
    if (isConditionFailedAt({ error, index: 0 })) {
      return jsonResponse(404, { reason: 'not-found' });
    }
    throw error;
  }
  return jsonResponse(200, toShop({ ...current, ...set }));
};
