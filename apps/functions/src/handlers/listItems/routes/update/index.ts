import { isConditionFailedAt } from '../../../../utils/isConditionFailedAt/index.ts';
import { HistoryItemSchema } from '../../../../utils/items/historyItem/index.ts';
import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { historyKey } from '../../../../utils/keys/historyKey/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { recordChange } from '../../../../utils/recordChange/index.ts';
import type { ItemRouteOptions } from '../../../../utils/resolveList/types.ts';
import type { TransactType } from '../../../../utils/table/types.ts';
import { EXISTS_CONDITION } from '../../constants.ts';
import { readItemChanges } from '../../utils/readItemChanges/index.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const updateListItem = async ({
  context: { user, table, scope },
  itemId,
}: ItemRouteOptions) => {
  const key = itemKey({ ...scope, itemId });
  const current = await table.get(key, ListItemSchema);
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
  const history = shopsChanged ? historyKey({ ...scope, name: updated.name }) : undefined;
  const historyItems: TransactType[] =
    history !== undefined && (await table.get(history, HistoryItemSchema)) !== undefined
      ? [
          {
            update: history,
            parts: { set: { shopIds: updated.shopIds } },
            condition: { expression: EXISTS_CONDITION },
          },
        ]
      : [];

  try {
    await recordChange({
      table,
      householdId: scope.householdId,
      type: 'item',
      id: itemId,
      items: [
        { update: key, parts: { set }, condition: { expression: EXISTS_CONDITION } },
        ...historyItems,
      ],
    });
  } catch (error) {
    if (isConditionFailedAt({ error, index: 0 })) {
      return jsonResponse(404, { reason: 'not-found' });
    }
    throw error;
  }
  return jsonResponse(200, toListItem(updated));
};
