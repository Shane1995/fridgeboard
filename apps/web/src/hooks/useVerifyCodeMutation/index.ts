import { MutationName } from '../../services/configuration/mutations/constants';
import type { VerifyResult } from '../../services/session/types';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useSessionContext } from '../useSessionContext';

export const useVerifyCodeMutation = (): MutationResult<VerifyResult, string> => {
  const { verifyCode } = useSessionContext();
  return useMutation({
    mutationFn: (code: string) => verifyCode(code),
    mutationKey: [MutationName.verifyCode],
  });
};
