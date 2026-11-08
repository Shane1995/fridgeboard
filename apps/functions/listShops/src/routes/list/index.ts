import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { queryShops } from '../../utils/queryShops/index.ts';

export const listListShops = async ({ table, scope }: ListRouteContext) =>
  jsonResponse(200, { shops: await queryShops({ table, scope }) });
