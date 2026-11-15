import type { ListRouteHandler } from '@fridgeboard/lambda-kit/utils/resolveList/types.ts';
import {
  CLEAR_ITEMS_ROUTE,
  CREATE_ITEM_ROUTE,
  GET_ITEM_ROUTE,
  LIST_HISTORY_ROUTE,
  LIST_ITEMS_ROUTE,
  REMOVE_ITEM_ROUTE,
  UPDATE_ITEM_ROUTE,
} from '../constants.ts';
import { clearListItems } from '../handlers/clear/index.ts';
import { createListItem } from '../handlers/create/index.ts';
import { getListItem } from '../handlers/get/index.ts';
import { listHistory } from '../handlers/history/index.ts';
import { listListItems } from '../handlers/list/index.ts';
import { removeListItem } from '../handlers/remove/index.ts';
import { updateListItem } from '../handlers/update/index.ts';

export const ENDPOINTS: ReadonlyMap<string, ListRouteHandler> = new Map<string, ListRouteHandler>([
  [LIST_ITEMS_ROUTE, listListItems],
  [CREATE_ITEM_ROUTE, createListItem],
  [GET_ITEM_ROUTE, getListItem],
  [UPDATE_ITEM_ROUTE, updateListItem],
  [REMOVE_ITEM_ROUTE, removeListItem],
  [CLEAR_ITEMS_ROUTE, clearListItems],
  [LIST_HISTORY_ROUTE, listHistory],
]);
