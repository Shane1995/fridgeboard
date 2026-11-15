import type { ListRouteHandler } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import {
  CREATE_SHOP_ROUTE,
  LIST_SHOPS_ROUTE,
  REMOVE_SHOP_ROUTE,
  REORDER_SHOPS_ROUTE,
  UPDATE_SHOP_ROUTE,
} from '../constants.ts';
import { createListShop } from '../handlers/create/index.ts';
import { listListShops } from '../handlers/list/index.ts';
import { removeListShop } from '../handlers/remove/index.ts';
import { reorderListShops } from '../handlers/reorder/index.ts';
import { updateListShop } from '../handlers/update/index.ts';

export const ENDPOINTS: ReadonlyMap<string, ListRouteHandler> = new Map<string, ListRouteHandler>([
  [LIST_SHOPS_ROUTE, listListShops],
  [CREATE_SHOP_ROUTE, createListShop],
  [REORDER_SHOPS_ROUTE, reorderListShops],
  [UPDATE_SHOP_ROUTE, updateListShop],
  [REMOVE_SHOP_ROUTE, removeListShop],
]);
