export enum ShopColor {
  Tomato = 'tomato',
  Mustard = 'mustard',
  Mint = 'mint',
  Sky = 'sky',
  Grape = 'grape',
  Pink = 'pink',
  Slate = 'slate',
  Black = 'black',
  Forest = 'forest',
  Lime = 'lime',
  Orange = 'orange',
  Navy = 'navy',
  Cyan = 'cyan',
  Yellow = 'yellow',
}

export const UNSORTED_SHOP_ID = 'unsorted';
export const UNSORTED_SHOP_NAME = 'Unassigned';
export const FOCUS_SHOP_STORAGE_KEY = 'fridgeboard.focusShop';

export const SHOP_FAILURE_COPY = {
  create: 'Could not add the shop. Try again.',
  update: 'Could not save the shop. Try again.',
  remove: 'Could not delete the shop. Try again.',
} as const;

export const ITEM_FAILURE_COPY = {
  add: (name: string) => `Could not add ${name}. Try again.`,
  update: 'Could not save the change. Try again.',
  remove: 'Could not delete the item. Try again.',
  clearTicked: 'Could not clear the ticked items. Try again.',
} as const;

export const PENDING_ITEM_PREFIX = 'pending-';
export const ITEM_NAME_MAX_LENGTH = 80;
export const SHOP_NAME_MAX_LENGTH = 30;

export const MAX_SUGGESTIONS = 5;
