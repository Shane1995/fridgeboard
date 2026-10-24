import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { queryBuckets } from '../../utils/queryBuckets/index.ts';

export const listListBuckets = async ({ table, scope }: ListRouteContext) =>
  jsonResponse(200, { buckets: await queryBuckets(table, scope) });
