import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import type { StartResult } from '../../services/session/types';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useSessionContext } from '../useSessionContext';

export const useStartSignInMutation = (): MutationResult<StartResult, string> => {
  const { startSignIn } = useSessionContext();
  return useMutation({
    mutationFn: (email: string) => startSignIn(email),
    mutationKey: [MutationName.startSignIn],
  });
};
