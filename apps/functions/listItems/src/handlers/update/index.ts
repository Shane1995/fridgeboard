import { isConditionFailedAt } from '@fridgeboard/lambda-kit/utils/isConditionFailedAt/index.ts';
import {
  getHistoryEntry,
  setHistoryShopsOp,
} from '@fridgeboard/lambda-kit/repository/history/index.ts';
import { getItem, updateItemOp } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readJsonBody } from '@fridgeboard/lambda-kit/utils/readJsonBody/index.ts';
import { recordChange } from '@fridgeboard/lambda-kit/utils/recordChange/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { readItemChanges } from '../../utils/readItemChanges/index.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const updateListItem = async ({ user, table, scope }: ListRouteContext) => {
  const itemId = readPathParameter({ user, name: 'itemId' });
  const current = await getItem({ table, scope, itemId });
  if (current === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }

  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const changes = await readItemChanges({ fields, table, scope });
  if (changes.status === 'invalid') {
    return jsonResponse(400, { reason: changes.reason });
  }

  const { set, shopsChanged } = changes;
  const updated = { ...current, ...set };
  const hasHistory =
    shopsChanged && (await getHistoryEntry({ table, scope, name: updated.name })) !== undefined;
  const historyItems = hasHistory
    ? [setHistoryShopsOp({ scope, name: updated.name, shopIds: updated.shopIds ?? [] })]
    : [];

  try {
    await recordChange({
      table,
      householdId: scope.householdId,
      changes: [{ type: 'item', id: itemId }],
      items: [updateItemOp({ scope, itemId, set }), ...historyItems],
    });
  } catch (error) {
    if (isConditionFailedAt({ error, index: 0 })) {
      return jsonResponse(404, { reason: 'not-found' });
    }
    throw error;
  }
  return jsonResponse(200, toListItem(updated));
};
