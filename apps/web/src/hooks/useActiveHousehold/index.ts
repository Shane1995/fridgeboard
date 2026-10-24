import type { IHouseholdSummary } from '@fridgeboard/contract/households';
import { useHouseholdsQuery } from '../useHouseholdsQuery';

export const useActiveHousehold = (): IHouseholdSummary | undefined => {
  const { data } = useHouseholdsQuery();
  return data?.households[0];
};
