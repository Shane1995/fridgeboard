import { MutationName } from '../../services/configuration/schema/constants';
import { WebService } from '../../services/configuration/schema/constants';
import { startRegistration } from '@simplewebauthn/browser';
import { completePasskeyRegistration } from '../../services/api/completePasskeyRegistration';
import { startPasskeyRegistration } from '../../services/api/startPasskeyRegistration';
import { FailureReason } from '../../services/session/constants';
import { resolveEndpoint } from '../../services/configuration/resolveEndpoint';
import { mergedEntry } from '../../utils/mergedEntry';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useRemoteConfigContext } from '../useRemoteConfigContext';
import { useSessionContext } from '../useSessionContext';
import type { RegisterPasskeyResult } from './types';

export const useRegisterPasskeyMutation = (): MutationResult<RegisterPasskeyResult, void> => {
  const { services, mutations } = useRemoteConfigContext();
  const { timeoutMs } = mergedEntry(mutations, MutationName.registerPasskey);
  const { apiFetch } = useSessionContext();
  return useMutation({
    mutationFn: async (): Promise<RegisterPasskeyResult> => {
      const started = await startPasskeyRegistration(
        resolveEndpoint(services.api, WebService.passkeysStart, timeoutMs),
        apiFetch,
      );
      if (!started.ok) {
        return started;
      }

      const credential = await startRegistration({ optionsJSON: started.options }).catch(
        () => undefined,
      );
      if (!credential) {
        return { ok: false, reason: FailureReason.Cancelled };
      }

      return completePasskeyRegistration(
        resolveEndpoint(services.api, WebService.passkeysComplete, timeoutMs),
        credential,
        apiFetch,
      );
    },
    mutationKey: [MutationName.registerPasskey],
  });
};
