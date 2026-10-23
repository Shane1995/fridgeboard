import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { useQueryClient } from '@tanstack/react-query';
import { completeOnboardingSection } from '../../utils/completeOnboardingSection';
import { postHousehold } from '../../services/api/postHousehold';
import type { PostHouseholdResult } from '../../services/api/postHousehold/types';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { ME_QUERY_KEY } from '../useMeQuery/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
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
        queryClient.setQueryData<IMeResponse>(ME_QUERY_KEY, (me) =>
          me === undefined
            ? me
            : completeOnboardingSection(
                {
                  ...me,
                  households: [
                    ...me.households,
                    { id: result.id, name: result.name, role: 'owner' },
                  ],
                },
                'household',
              ),
        );
      }
      return result;
    },
    mutationKey: [MutationName.createHousehold],
  });
};
