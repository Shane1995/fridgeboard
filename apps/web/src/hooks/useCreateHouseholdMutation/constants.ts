import type { ICreateHouseholdErrorResponse } from '@fridgeboard/contract/households';

export const HOUSEHOLD_FAILURES: readonly ICreateHouseholdErrorResponse['reason'][] = [
  'invalid-name',
  'not-allowed',
  'household-exists',
];
