import { startSignIn } from '../../services/session/startSignIn';
import type { StartResult } from '../../services/session/types';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';

export const useStartSignInMutation = (): MutationResult<StartResult, string> =>
  useMutation({ mutationFn: startSignIn });
