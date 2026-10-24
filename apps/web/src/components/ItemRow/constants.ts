import { ITEM_NAME_MAX_LENGTH } from '../../services/shoppingList/constants';

export const SHOPS_ACTION = 'shops';
export const INFO_ACTION = 'info';
export const DELETE_ACTION = 'delete';
export const EDIT_MAX_LENGTH = ITEM_NAME_MAX_LENGTH;

export const ITEM_ROW_COPY = {
  menu: 'Item options',
  edit: 'Edit item',
  info: 'Info',
  shops: 'Shops',
  delete: 'Delete',
} as const;
