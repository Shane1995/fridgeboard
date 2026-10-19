import type { ICreateHouseholdErrorResponse } from '@fridgeboard/contract/households';

export type PostHouseholdFailureReason = ICreateHouseholdErrorResponse['reason'] | 'unknown';

export type PostHouseholdResult =
  | { ok: true; id: string; name: string }
  | { ok: false; reason: PostHouseholdFailureReason };
