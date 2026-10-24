import type { IMeResponse } from '@fridgeboard/contract/me';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import type { OnboardingSectionId } from '../../services/onboarding/constants';
import { completeOnboardingSection } from '../../utils/completeOnboardingSection';
import { ME_QUERY_KEY } from '../useMeQuery/constants';
import { ONBOARDING_QUERY_KEY } from '../useOnboardingQuery/constants';

// Removes a finished section from the cache and tells `/me` when none are left, so the gate
// lets the user through without another round trip.
export const useCompleteOnboardingSection = (): ((id: OnboardingSectionId) => void) => {
  const queryClient = useQueryClient();
  return (id) => {
    queryClient.setQueryData<IOnboardingResponse>([ONBOARDING_QUERY_KEY], (onboarding) =>
      onboarding === undefined ? onboarding : completeOnboardingSection(onboarding, id),
    );
    const remaining = queryClient.getQueryData<IOnboardingResponse>([ONBOARDING_QUERY_KEY]);
    queryClient.setQueryData<IMeResponse>([ME_QUERY_KEY], (me) =>
      me === undefined || remaining === undefined
        ? me
        : { ...me, hasOnboarding: remaining.sections.length > 0 },
    );
  };
};
