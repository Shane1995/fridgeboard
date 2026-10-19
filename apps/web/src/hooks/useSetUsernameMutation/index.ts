import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { useQueryClient } from '@tanstack/react-query';
import { completeOnboardingSection } from '../../utils/completeOnboardingSection';
import { putUsername } from '../../services/api/putUsername';
import type { PutUsernameResult } from '../../services/api/putUsername/types';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import { ME_QUERY_KEY } from '../useMeQuery/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';

export const useSetUsernameMutation = (): MutationResult<PutUsernameResult, string> => {
  const { services } = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const result = await putUsername(
        resolveServicePath(services, WebService.username),
        username,
        apiFetch,
      );
      if (result.ok) {
        queryClient.setQueryData<IMeResponse>(ME_QUERY_KEY, (me) =>
          me === undefined
            ? me
            : completeOnboardingSection({ ...me, username: result.username }, 'username'),
        );
      }
      return result;
    },
    mutationKey: [MutationName.setUsername],
  });
};
