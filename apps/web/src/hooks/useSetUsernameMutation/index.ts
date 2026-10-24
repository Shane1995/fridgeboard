import type { IMeResponse } from '@fridgeboard/contract/me';
import type {
  IUsernameErrorResponse,
  IUsernameRequest,
  IUsernameResponse,
} from '@fridgeboard/contract/username';
import { useQueryClient } from '@tanstack/react-query';
import type { ApiResult } from '../../services/api/sendJson/types';
import { MutationName } from '../../services/configuration/mutations/constants';
import { WebService } from '../../services/configuration/services/constants';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { useApiMutation } from '../useApiMutation';
import { useCompleteOnboardingSection } from '../useCompleteOnboardingSection';
import { ME_QUERY_KEY } from '../useMeQuery/constants';
import type { MutationResult } from '../useMutation/types';
import { USERNAME_FAILURES } from './constants';

export const useSetUsernameMutation = (): MutationResult<
  ApiResult<IUsernameResponse, IUsernameErrorResponse['reason']>,
  string
> => {
  const queryClient = useQueryClient();
  const completeSection = useCompleteOnboardingSection();
  return useApiMutation({
    name: MutationName.setUsername,
    service: WebService.username,
    method: 'PUT',
    toBody: (username: string): IUsernameRequest => ({ username }),
    reasons: USERNAME_FAILURES,
    onSuccess: ({ username }: IUsernameResponse) => {
      queryClient.setQueryData<IMeResponse>([ME_QUERY_KEY], (me) =>
        me === undefined ? me : { ...me, username },
      );
      completeSection(OnboardingSectionId.Username);
    },
  });
};
