import { MutationName } from '../../services/configuration/mutations/constants';
import { startAuthentication } from '@simplewebauthn/browser';
import { UNKNOWN_REASON } from '../../services/session/constants';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { useSessionContext } from '../useSessionContext';
import type { PasskeySignInResult } from './types';

export const useSignInWithPasskeyMutation = (): MutationResult<PasskeySignInResult, string> => {
  const { startPasskeySignIn, verifyPasskey } = useSessionContext();
  return useMutation({
    mutationFn: async (email: string): Promise<PasskeySignInResult> => {
      const started = await startPasskeySignIn(email);
      if (!started.ok) {
        return 'fallback' in started ? { ok: false, reason: 'fallback' } : started;
      }

      const credential = await startAuthentication({ optionsJSON: started.options }).catch(
        () => undefined,
      );
      if (!credential) {
        return { ok: false, reason: 'cancelled' };
      }

      const verified = await verifyPasskey(credential);
      if (verified.ok) {
        return { ok: true };
      }
      return { ok: false, reason: 'reason' in verified ? verified.reason : UNKNOWN_REASON };
    },
    mutationKey: [MutationName.signInWithPasskey],
  });
};
