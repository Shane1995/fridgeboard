import type { ICreateHouseholdErrorResponse } from '@fridgeboard/contract/households';

export const REASONS: readonly ICreateHouseholdErrorResponse['reason'][] = [
  'invalid-name',
  'not-allowed',
  'household-exists',
];
