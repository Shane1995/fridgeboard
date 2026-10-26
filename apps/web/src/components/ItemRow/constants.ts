import { ITEM_NAME_MAX_LENGTH } from '../../services/shoppingList/constants';

export const SHOPS_ACTION = 'shops';
export const INFO_ACTION = 'info';
export const DELETE_ACTION = 'delete';
export const SPLIT_ACTION = 'split';
export const SPLIT_OUT_ACTION = 'split-out';
export const COMBINE_ACTION = 'combine';
export const EDIT_MAX_LENGTH = ITEM_NAME_MAX_LENGTH;
export const MAX_SHOP_BADGES = 3;

export const ITEM_ROW_COPY = {
  menu: 'Item options',
  edit: 'Edit item',
  info: 'Info',
  shops: 'Shops',
  alsoIn: (names: string[]) => `Also in ${names.join(', ')}`,
  splitAll: 'Split into every shop',
  splitOut: (shopName: string) => `Split out of ${shopName}`,
  combine: (others: number) => `Combine with ${others} other${others === 1 ? '' : 's'}`,
  delete: 'Delete',
} as const;
