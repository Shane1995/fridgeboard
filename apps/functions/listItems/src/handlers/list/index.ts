import { queryItems } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { queryShops } from '@fridgeboard/lambda-kit/repository/shops/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const listListItems = async ({ table, scope }: ListRouteContext) => {
  const [items, shops] = await Promise.all([
    queryItems({ table, scope }),
    queryShops({ table, scope }),
  ]);
  return jsonResponse(200, {
    items: items.map((row) => toListItem({ row, shops })).sort((a, b) => a.createdAt - b.createdAt),
  });
};
