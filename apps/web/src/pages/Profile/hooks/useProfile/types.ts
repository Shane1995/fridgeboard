import type { IHouseholdSummary } from '@fridgeboard/contract/households';
import type { IMeResponse } from '@fridgeboard/contract/me';

export type ProfileState = {
  me: IMeResponse | undefined;
  households: readonly IHouseholdSummary[];
  isLoadingHouseholds: boolean;
  hasHouseholdsError: boolean;
};
