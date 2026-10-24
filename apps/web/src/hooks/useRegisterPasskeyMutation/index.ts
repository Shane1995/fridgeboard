import type { IPasskeyCredentialRequest } from '@fridgeboard/contract/auth';
import { startRegistration } from '@simplewebauthn/browser';
import { sendJson } from '../../services/api/sendJson';
import { MutationName, WebService } from '../../services/configuration/schema/constants';
import { resolveEndpoint } from '../../services/configuration/resolveEndpoint';
import { FAILURE_REASONS, FailureReason, POST } from '../../services/session/constants';
import { isCreationOptions } from '../../services/session/utils/isCreationOptions';
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
      const started = await sendJson<{ options?: unknown } | undefined, FailureReason>(
        resolveEndpoint({ api: services.api, service: WebService.passkeysStart, timeoutMs }),
        POST,
        undefined,
        FAILURE_REASONS,
        apiFetch,
      );
      if (!started.ok) {
        return started;
      }
      const options = started.data?.options;
      if (!isCreationOptions(options)) {
        return { ok: false, reason: FailureReason.Unknown };
      }

      const credential = await startRegistration({ optionsJSON: options }).catch(() => undefined);
      if (!credential) {
        return { ok: false, reason: FailureReason.Cancelled };
      }

      const payload: IPasskeyCredentialRequest = { credential: { ...credential } };
      const completed = await sendJson<unknown, FailureReason>(
        resolveEndpoint({ api: services.api, service: WebService.passkeysComplete, timeoutMs }),
        POST,
        payload,
        FAILURE_REASONS,
        apiFetch,
      );
      return completed.ok ? { ok: true } : completed;
    },
    mutationKey: [MutationName.registerPasskey],
  });
};
