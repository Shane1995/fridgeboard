import { useHouseholdsQuery } from '../../../../hooks/useHouseholdsQuery';
import { useMeQuery } from '../../../../hooks/useMeQuery';
import type { ProfileState } from './types';

export const useProfile = (): ProfileState => {
  const { data: me } = useMeQuery();
  const households = useHouseholdsQuery();

  return {
    me,
    households: households.data?.households ?? [],
    isLoadingHouseholds: households.isPending,
    hasHouseholdsError: households.isError,
  };
};
