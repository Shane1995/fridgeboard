import { SHOP_SK_PREFIX } from '../constants.ts';

export const shopPrefix = (listId: string): string => `${SHOP_SK_PREFIX}${listId}#`;
