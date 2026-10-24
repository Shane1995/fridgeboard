import { membershipGsiKey } from '../keys/membershipGsiKey/index.ts';
import type { QueryParams } from '../table/types.ts';
import { MEMBERSHIP_INDEX, MEMBERSHIP_PK_VALUE, MEMBERSHIP_QUERY } from './constants.ts';

export const membershipQuery = (sub: string): QueryParams => ({
  IndexName: MEMBERSHIP_INDEX,
  KeyConditionExpression: MEMBERSHIP_QUERY,
  ExpressionAttributeValues: { [MEMBERSHIP_PK_VALUE]: membershipGsiKey(sub).GSI1PK },
});
