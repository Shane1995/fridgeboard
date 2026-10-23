import { MutationName } from '@fridgeboard/contract/configuration/mutations/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { startRegistration } from '@simplewebauthn/browser';
import { completePasskeyRegistration } from '../../services/api/completePasskeyRegistration';
import { startPasskeyRegistration } from '../../services/api/startPasskeyRegistration';
import { resolveMutationEndpoint } from '../../services/configuration/resolveEndpoint';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import type { RegisterPasskeyResult } from './types';

export const useRegisterPasskeyMutation = (): MutationResult<RegisterPasskeyResult, void> => {
  const configuration = useRemoteConfigContext();
  const { apiFetch } = useSessionContext();
  return useMutation({
    mutationFn: async (): Promise<RegisterPasskeyResult> => {
      const started = await startPasskeyRegistration(
        resolveMutationEndpoint(configuration, WebService.passkeysStart),
        apiFetch,
      );
      if (!started.ok) {
        return started;
      }

      const credential = await startRegistration({ optionsJSON: started.options }).catch(
        () => undefined,
      );
      if (!credential) {
        return { ok: false, reason: 'cancelled' };
      }

      return completePasskeyRegistration(
        resolveMutationEndpoint(configuration, WebService.passkeysComplete),
        credential,
        apiFetch,
      );
    },
    mutationKey: [MutationName.registerPasskey],
  });
};
