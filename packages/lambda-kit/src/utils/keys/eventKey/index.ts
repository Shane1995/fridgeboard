import { EVENT_SK_PREFIX, HOUSEHOLD_PK_PREFIX } from '../constants.ts';
import type { TableKey } from '../types.ts';
import type { EventKeyOptions } from './types.ts';

export const eventKey = ({ householdId, startDate, eventId }: EventKeyOptions): TableKey => ({
  PK: `${HOUSEHOLD_PK_PREFIX}${householdId}`,
  SK: `${EVENT_SK_PREFIX}${startDate}#${eventId}`,
});
