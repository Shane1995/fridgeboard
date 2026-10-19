import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { resolveServicePath } from '../../services/configuration/resolveServicePath';
import type { VerifyResult } from '../../services/session/types';
import { verifyCode } from '../../services/session/verifyCode';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfig } from '../useRemoteConfig';
import { useSessionConfig } from '../useSessionConfig';

export const useVerifyCodeMutation = (): MutationResult<VerifyResult, string> => {
  const { services } = useRemoteConfig();
  const sessionConfig = useSessionConfig();
  return useMutation({
    mutationFn: (code: string) =>
      verifyCode(resolveServicePath(services, WebService.verify), sessionConfig, code),
    mutationKey: [MutationName.verifyCode],
  });
};
