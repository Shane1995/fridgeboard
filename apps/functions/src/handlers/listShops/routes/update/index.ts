import { SHOP_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { ShopItemSchema } from '../../../../utils/items/shopItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { shopKey } from '../../../../utils/keys/shopKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import type { ShopRouteOptions } from '../../../../utils/resolveList/types.ts';
import { readColor } from '../../utils/readColor/index.ts';
import { toShop } from '../../utils/toShop/index.ts';

export const updateListShop = async ({
  context: { user, table, scope },
  shopId,
}: ShopRouteOptions) => {
  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const set: Record<string, unknown> = {};

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

  const updated = await table.update({
    key: shopKey({ ...scope, shopId }),
    parts: { set },
    schema: ShopItemSchema,
  });
  return updated === undefined
    ? jsonResponse(404, { reason: 'not-found' })
    : jsonResponse(200, toShop(updated));
};
