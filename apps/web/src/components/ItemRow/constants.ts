import { ITEM_NAME_MAX_LENGTH } from '../../services/shoppingList/constants';

export const MOVE_ACTION_PREFIX = 'move:';
export const MOVE_ACTION = 'move';
export const INFO_ACTION = 'info';
export const DELETE_ACTION = 'delete';
export const EDIT_MAX_LENGTH = ITEM_NAME_MAX_LENGTH;

export const ITEM_ROW_COPY = {
  menu: 'Item options',
  edit: 'Edit item',
  info: 'Info',
  move: 'Move',
  moveTo: 'Move to',
  delete: 'Delete',
} as const;
