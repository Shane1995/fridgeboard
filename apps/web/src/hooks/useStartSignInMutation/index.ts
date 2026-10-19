import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import { startSignIn } from '../../services/session/startSignIn';
import type { StartResult } from '../../services/session/types';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfig } from '../useRemoteConfig';

export const useStartSignInMutation = (): MutationResult<StartResult, string> => {
  const { services } = useRemoteConfig();
  return useMutation({
    mutationFn: (email: string) =>
      startSignIn(resolveServicePath(services, WebService.start), email),
    mutationKey: [MutationName.startSignIn],
  });
};
