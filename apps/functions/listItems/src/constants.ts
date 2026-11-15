import { LIST_PATH } from '@fridgeboard/lambda-kit/utils/resolveList/constants.ts';

export const LIST_ITEMS_ROUTE = `GET ${LIST_PATH}/items`;
export const CREATE_ITEM_ROUTE = `POST ${LIST_PATH}/items`;
export const GET_ITEM_ROUTE = `GET ${LIST_PATH}/items/{itemId}`;
export const UPDATE_ITEM_ROUTE = `PATCH ${LIST_PATH}/items/{itemId}`;
export const REMOVE_ITEM_ROUTE = `DELETE ${LIST_PATH}/items/{itemId}`;
export const CLEAR_ITEMS_ROUTE = `DELETE ${LIST_PATH}/items/clear`;
export const LIST_HISTORY_ROUTE = `GET ${LIST_PATH}/history`;
export const CLEAR_BY_ALL = 'all';
export const CLEAR_BY_CHECKED = 'checked';
export const CLEAR_WRITES_LIMIT = 98;
