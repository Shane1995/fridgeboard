import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { shopKey } from '../../../../utils/keys/shopKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { recordChange } from '../../../../utils/recordChange/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { REORDER_ID } from '../../constants.ts';
import { queryShops } from '../../utils/queryShops/index.ts';

export const reorderListShops = async ({ user, table, scope }: ListRouteContext) => {
  const body = readJsonBody(user.event);
  const ids =
    typeof body === 'object' && body !== null ? (body as { ids?: unknown }).ids : undefined;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }

  const existing = await queryShops({ table, scope });
  if (!ids.every((id) => existing.some((shop) => shop.id === id))) {
    return jsonResponse(400, { reason: 'invalid-shop' });
  }

  const rank = (id: string) => {
    const index = ids.indexOf(id);
    return index === -1 ? ids.length : index;
  };
  const reordered = [...existing]
    .sort((a, b) => rank(a.id) - rank(b.id) || a.order - b.order)
    .map((shop, order) => ({ ...shop, order }));
  const moved = reordered.filter(
    (shop, index) => existing.find(({ id }) => id === shop.id)?.order !== index,
  );
  if (moved.length > 0) {
    await recordChange({
      table,
      householdId: scope.householdId,
      type: 'shop',
      id: REORDER_ID,
      items: moved.map((shop) => ({
        update: shopKey({ ...scope, shopId: shop.id }),
        parts: { set: { order: shop.order } },
      })),
    });
  }
  return jsonResponse(200, { shops: reordered });
};
