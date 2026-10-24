import { MutationName } from '../../services/configuration/mutations/constants';
import { WebService } from '../../services/configuration/services/constants';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import { postHousehold } from '../../services/api/postHousehold';
import type { PostHouseholdResult } from '../../services/api/postHousehold/types';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { completeOnboardingSection } from '../../utils/completeOnboardingSection';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { ONBOARDING_QUERY_KEY } from '../useOnboardingQuery/constants';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';

export const useCreateHouseholdMutation = (): MutationResult<PostHouseholdResult, string> => {
  const configuration = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const result = await postHousehold(
        resolveMutationEndpoint(configuration, WebService.households),
        name,
        apiFetch,
      );
      if (result.ok) {
        queryClient.setQueryData<IOnboardingResponse>([ONBOARDING_QUERY_KEY], (onboarding) =>
          onboarding === undefined
            ? onboarding
            : completeOnboardingSection(onboarding, OnboardingSectionId.Household),
        );
      }
      return result;
    },
    mutationKey: [MutationName.createHousehold],
  });
};
