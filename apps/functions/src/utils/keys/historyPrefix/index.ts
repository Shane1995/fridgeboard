import { HISTORY_SK_PREFIX } from '../constants.ts';

export const historyPrefix = (listId: string): string => `${HISTORY_SK_PREFIX}${listId}#`;
