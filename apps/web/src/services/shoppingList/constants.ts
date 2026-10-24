export enum BucketColor {
  Tomato = 'tomato',
  Mustard = 'mustard',
  Mint = 'mint',
  Sky = 'sky',
  Grape = 'grape',
  Pink = 'pink',
  Slate = 'slate',
}

export const UNSORTED_BUCKET_ID = 'unsorted';
export const UNSORTED_BUCKET_NAME = 'General';
export const LAST_BUCKET_STORAGE_KEY = 'fridgeboard.lastBucket';
export const FOCUS_BUCKET_STORAGE_KEY = 'fridgeboard.focusBucket';

export const shoppingListStorageKey = (householdId: string): string =>
  `fridgeboard.shoppingList.${householdId}`;

export const ITEM_NAME_MAX_LENGTH = 80;
export const BUCKET_NAME_MAX_LENGTH = 30;

export const MAX_SUGGESTIONS = 5;
