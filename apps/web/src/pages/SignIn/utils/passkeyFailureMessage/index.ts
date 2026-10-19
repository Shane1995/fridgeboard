import { SIGN_IN_COPY } from '../../constants';
import type { PasskeySignInResult } from '../../../../hooks/useSignInWithPasskeyMutation/types';

export const passkeyFailureMessage = (
  reason: Extract<PasskeySignInResult, { ok: false }>['reason'],
): string => {
  if (reason === 'fallback') {
    return SIGN_IN_COPY.passkey.noPasskey;
  }
  if (reason === 'cancelled') {
    return SIGN_IN_COPY.passkey.cancelled;
  }
  return SIGN_IN_COPY.reasons[reason];
};
