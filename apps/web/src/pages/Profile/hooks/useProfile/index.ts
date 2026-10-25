import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { useHouseholdsQuery } from '../../../../hooks/useHouseholdsQuery';
import { useMeQuery } from '../../../../hooks/useMeQuery';
import { useMembersQuery } from '../../../../hooks/useMembersQuery';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import type { ProfileState } from './types';

export const useProfile = (): ProfileState => {
  const { data: me } = useMeQuery();
  const households = useHouseholdsQuery();
  const showMembers = useFeatureFlag(WebFeatureFlag.ENABLE_HOUSEHOLD_INVITES);
  const members = useMembersQuery({ enabled: showMembers });

  return {
    me,
    households: households.data?.households ?? [],
    isLoadingHouseholds: households.isPending,
    hasHouseholdsError: households.isError,
    showMembers,
    members: members.data?.members ?? [],
    hasMembersError: members.isError,
  };
};
