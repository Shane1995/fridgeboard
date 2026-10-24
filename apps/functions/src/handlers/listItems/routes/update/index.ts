import { LIST_ITEM_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { bucketExists } from '../../../../utils/bucketExists/index.ts';
import { HistoryItemSchema } from '../../../../utils/items/historyItem/index.ts';
import { ListItemSchema } from '../../../../utils/items/listItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { historyKey } from '../../../../utils/keys/historyKey/index.ts';
import { itemKey } from '../../../../utils/keys/itemKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import type { ItemRouteOptions } from '../../../../utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const updateListItem = async ({
  context: { user, table, scope },
  itemId,
}: ItemRouteOptions) => {
  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const set: Record<string, unknown> = {};

  if ('name' in fields) {
    const name = readText({ value: fields.name, maxLength: LIST_ITEM_NAME_MAX_LENGTH });
    if (name === undefined) {
      return jsonResponse(400, { reason: 'invalid-name' });
    }
    set.name = name;
  }
  if ('bucketId' in fields) {
    if (
      typeof fields.bucketId !== 'string' ||
      !(await bucketExists({ table, scope, bucketId: fields.bucketId }))
    ) {
      return jsonResponse(400, { reason: 'invalid-bucket' });
    }
    set.bucketId = fields.bucketId;
  }
  if ('checked' in fields) {
    if (typeof fields.checked !== 'boolean') {
      return jsonResponse(400, { reason: 'invalid-request' });
    }
    set.checked = fields.checked;
  }
  if (Object.keys(set).length === 0) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }

  const updated = await table.update({
    key: itemKey({ ...scope, itemId }),
    parts: { set },
    schema: ListItemSchema,
  });
  if (updated === undefined) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  if (typeof set.bucketId === 'string') {
    await table.update({
      key: historyKey({ ...scope, name: updated.name }),
      parts: { set: { bucketId: set.bucketId } },
      schema: HistoryItemSchema,
    });
  }
  return jsonResponse(200, toListItem(updated));
};
