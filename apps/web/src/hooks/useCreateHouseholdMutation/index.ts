import { postHousehold } from '../../services/api/postHousehold';
import type { PostHouseholdResult } from '../../services/api/postHousehold/types';
import { MutationName } from '../../services/configuration/mutations/constants';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { WebService } from '../../services/configuration/services/constants';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { useCompleteOnboardingSection } from '../useCompleteOnboardingSection';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';

export const useCreateHouseholdMutation = (): MutationResult<PostHouseholdResult, string> => {
  const configuration = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const completeSection = useCompleteOnboardingSection();
  return useMutation({
    mutationFn: async (name: string) => {
      const result = await postHousehold(
        resolveMutationEndpoint(configuration, WebService.households),
        name,
        apiFetch,
      );
      if (result.ok) {
        completeSection(OnboardingSectionId.Household);
      }
      return result;
    },
    mutationKey: [MutationName.createHousehold],
  });
};
