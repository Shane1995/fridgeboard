import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import type { ListRouteContext } from '../../../../utils/resolveList/types.ts';
import { queryShops } from '../../utils/queryShops/index.ts';

export const listListShops = async ({ table, scope }: ListRouteContext) =>
  jsonResponse(200, { shops: await queryShops({ table, scope }) });
