import { getItem } from '@fridgeboard/lambda-kit/repository/items/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readPathParameter } from '@fridgeboard/lambda-kit/utils/readPathParameter/index.ts';
import type { ListRouteContext } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import { toListItem } from '../../utils/toListItem/index.ts';

export const getListItem = async ({ user, table, scope }: ListRouteContext) => {
  const itemId = readPathParameter({ user, name: 'itemId' });
  const item = await getItem({ table, scope, itemId });
  return item === undefined
    ? jsonResponse(404, { reason: 'not-found' })
    : jsonResponse(200, toListItem(item));
};
