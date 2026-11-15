import { queryShops } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';

export const listListShops = async ({ table, scope }: ListRouteContext) =>
  jsonResponse(200, { shops: await queryShops({ table, scope }) });
