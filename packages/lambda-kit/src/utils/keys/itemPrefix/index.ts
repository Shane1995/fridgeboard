import { ITEM_SK_PREFIX } from '../constants.ts';

export const itemPrefix = (listId: string): string => `${ITEM_SK_PREFIX}${listId}#`;
