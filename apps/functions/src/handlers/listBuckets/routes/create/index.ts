import { BUCKET_NAME_MAX_LENGTH } from '@fridgeboard/contract/lists/constants';
import type { IBucket } from '@fridgeboard/contract/lists';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { bucketKey } from '../../../../utils/keys/bucketKey/index.ts';
import { newId } from '../../../../utils/newId/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import { readText } from '../../../../utils/readText/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { queryBuckets } from '../../utils/queryBuckets/index.ts';
import { readColor } from '../../utils/readColor/index.ts';

export const createListBucket = async ({ user, table, scope }: ListRouteContext) => {
  const body = readJsonBody(user.event);
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = readText({ value: fields.name, maxLength: BUCKET_NAME_MAX_LENGTH });
  if (name === undefined) {
    return jsonResponse(400, { reason: 'invalid-name' });
  }
  const color = readColor(fields.color);
  if (color === undefined) {
    return jsonResponse(400, { reason: 'invalid-color' });
  }

  const existing = await queryBuckets({ table, scope });
  const order = existing.reduce((highest, bucket) => Math.max(highest, bucket.order), -1) + 1;
  const bucket: IBucket = { id: newId(), name, color, order };
  await table.put({ ...bucketKey({ ...scope, bucketId: bucket.id }), ...bucket });
  return jsonResponse(201, bucket);
};
