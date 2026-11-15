import { LIST_PATH } from '@fridgeboard/lambda-kit/utils/resolveList/constants.ts';

export const LIST_SHOPS_ROUTE = `GET ${LIST_PATH}/shops`;
export const CREATE_SHOP_ROUTE = `POST ${LIST_PATH}/shops`;
export const REORDER_SHOPS_ROUTE = `PUT ${LIST_PATH}/shops/order`;
export const UPDATE_SHOP_ROUTE = `PATCH ${LIST_PATH}/shops/{shopId}`;
export const REMOVE_SHOP_ROUTE = `DELETE ${LIST_PATH}/shops/{shopId}`;
export const REMOVE_WRITES_LIMIT = 97;
export const REORDER_ID = 'order';
