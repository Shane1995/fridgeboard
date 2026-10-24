import type {
  ICreateHouseholdErrorResponse,
  IHouseholdSummary,
} from '@fridgeboard/contract/households';

export type PostHouseholdFailureReason = ICreateHouseholdErrorResponse['reason'] | 'unknown';

export type PostHouseholdResult =
  | { ok: true; household: IHouseholdSummary }
  | { ok: false; reason: PostHouseholdFailureReason };
