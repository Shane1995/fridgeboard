import { queryHistory } from '@fridgeboard/lambda-kit/repository/history/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';

export const listHistory = async ({ table, scope }: ListRouteContext) => {
  const entries = await queryHistory({ table, scope });
  return jsonResponse(200, {
    entries: entries
      .map(({ name, shopIds, count }) => ({ name, shopIds: shopIds ?? [], count }))
      .sort((a, b) => b.count - a.count),
  });
};
