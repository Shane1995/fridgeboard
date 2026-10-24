import type { IMeResponse } from '@fridgeboard/contract/me';
import { useQueryClient } from '@tanstack/react-query';
import { putUsername } from '../../services/api/putUsername';
import type { PutUsernameResult } from '../../services/api/putUsername/types';
import { MutationName } from '../../services/configuration/mutations/constants';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { WebService } from '../../services/configuration/services/constants';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { useCompleteOnboardingSection } from '../useCompleteOnboardingSection';
import { ME_QUERY_KEY } from '../useMeQuery/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';

export const useSetUsernameMutation = (): MutationResult<PutUsernameResult, string> => {
  const configuration = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const queryClient = useQueryClient();
  const completeSection = useCompleteOnboardingSection();
  return useMutation({
    mutationFn: async (username: string) => {
      const result = await putUsername(
        resolveMutationEndpoint(configuration, WebService.username),
        username,
        apiFetch,
      );
      if (result.ok) {
        queryClient.setQueryData<IMeResponse>([ME_QUERY_KEY], (me) =>
          me === undefined ? me : { ...me, username: result.username },
        );
        completeSection(OnboardingSectionId.Username);
      }
      return result;
    },
    mutationKey: [MutationName.setUsername],
  });
};
