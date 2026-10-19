import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import type { VerifyResult } from '../../services/session/types';
import { verifyCode } from '../../services/session/verifyCode';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';

export const useVerifyCodeMutation = (): MutationResult<VerifyResult, string> =>
  useMutation({ mutationFn: verifyCode, mutationKey: [MutationName.verifyCode] });
