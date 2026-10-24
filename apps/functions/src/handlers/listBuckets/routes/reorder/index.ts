import { BucketItemSchema } from '../../../../utils/items/bucketItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { bucketKey } from '../../../../utils/keys/bucketKey/index.ts';
import { readJsonBody } from '../../../../utils/readJsonBody/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { queryBuckets } from '../../utils/queryBuckets/index.ts';

export const reorderListBuckets = async ({ user, table, scope }: ListRouteContext) => {
  const body = readJsonBody(user.event);
  const ids =
    typeof body === 'object' && body !== null ? (body as { ids?: unknown }).ids : undefined;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
    return jsonResponse(400, { reason: 'invalid-request' });
  }

  const existing = await queryBuckets(table, scope);
  if (!ids.every((id) => existing.some((bucket) => bucket.id === id))) {
    return jsonResponse(400, { reason: 'invalid-bucket' });
  }

  const rank = (id: string) => {
    const index = ids.indexOf(id);
    return index === -1 ? ids.length : index;
  };
  const reordered = [...existing]
    .sort((a, b) => rank(a.id) - rank(b.id) || a.order - b.order)
    .map((bucket, order) => ({ ...bucket, order }));
  await Promise.all(
    reordered
      .filter((bucket, index) => existing.find(({ id }) => id === bucket.id)?.order !== index)
      .map((bucket) =>
        table.update(
          bucketKey(scope.householdId, scope.listId, bucket.id),
          { set: { order: bucket.order } },
          BucketItemSchema,
        ),
      ),
  );
  return jsonResponse(200, { buckets: reordered });
};
