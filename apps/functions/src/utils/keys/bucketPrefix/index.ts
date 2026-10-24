import { BUCKET_SK_PREFIX } from '../constants.ts';

export const bucketPrefix = (listId: string): string => `${BUCKET_SK_PREFIX}${listId}#`;
