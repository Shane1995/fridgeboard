import { BUCKET_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import { BucketItemSchema } from '../../../../utils/items/bucketItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { bucketKey } from '../../../../utils/keys/bucketKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { readColor } from '../../utils/readColor/index.ts';
import { toBucket } from '../../utils/toBucket/index.ts';

export const updateListBucket = async (
  { user, table, scope }: ListRouteContext,
  bucketId: string,
) => {
  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const set: Record<string, unknown> = {};

  if ('name' in fields) {
    const name = readText(fields.name, BUCKET_NAME_MAX_LENGTH);
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

  const updated = await table.update(
    bucketKey(scope.householdId, scope.listId, bucketId),
    { set },
    BucketItemSchema,
  );
  return updated === undefined
    ? jsonResponse(404, { reason: 'not-found' })
    : jsonResponse(200, toBucket(updated));
};
