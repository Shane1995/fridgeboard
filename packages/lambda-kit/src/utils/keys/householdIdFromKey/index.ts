import { HOUSEHOLD_PK_PREFIX } from '../constants.ts';

export const householdIdFromKey = (key: unknown): string | undefined =>
  typeof key === 'string' &&
  key.startsWith(HOUSEHOLD_PK_PREFIX) &&
  key.length > HOUSEHOLD_PK_PREFIX.length
    ? key.slice(HOUSEHOLD_PK_PREFIX.length)
    : undefined;
