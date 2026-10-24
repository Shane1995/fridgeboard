import { MutationName } from '../../services/configuration/mutations/constants';
import { WebService } from '../../services/configuration/services/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import { putUsername } from '../../services/api/putUsername';
import type { PutUsernameResult } from '../../services/api/putUsername/types';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { completeOnboardingSection } from '../../utils/completeOnboardingSection';
import { ME_QUERY_KEY } from '../useMeQuery/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { ONBOARDING_QUERY_KEY } from '../useOnboardingQuery/constants';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';

export const useSetUsernameMutation = (): MutationResult<PutUsernameResult, string> => {
  const configuration = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const queryClient = useQueryClient();
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
        queryClient.setQueryData<IOnboardingResponse>([ONBOARDING_QUERY_KEY], (onboarding) =>
          onboarding === undefined
            ? onboarding
            : completeOnboardingSection(onboarding, OnboardingSectionId.Username),
        );
      }
      return result;
    },
    mutationKey: [MutationName.setUsername],
  });
};
