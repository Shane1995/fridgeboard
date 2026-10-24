import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState, type FormEvent } from 'react';
import { useFeatureFlag } from '../../../../../../hooks/useFeatureFlag';
import { usePasskeyDevice } from '../../../../../../hooks/usePasskeyDevice';
import { useSignInWithPasskeyMutation } from '../../../../../../hooks/useSignInWithPasskeyMutation';
import { useStartSignInMutation } from '../../../../../../hooks/useStartSignInMutation';
import { WebFeatureFlag } from '../../../../../../services/configuration/schema/constants';
import { FailureReason } from '../../../../../../services/session/constants';
import { EMAIL_MARKER, SIGN_IN_COPY } from '../../../../constants';
import type { EmailStepProps } from '../../types';
import type { EmailStepState } from './types';

export const useEmailStep = ({ initialEmail, onCodeSent }: EmailStepProps): EmailStepState => {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const start = useStartSignInMutation();
  const signInWithPasskey = useSignInWithPasskeyMutation();
  const device = usePasskeyDevice();
  const passkeysAvailable =
    useFeatureFlag(WebFeatureFlag.ENABLE_PASSKEYS) && browserSupportsWebAuthn();

  const handleSubmit = (event: Pick<FormEvent, 'preventDefault'>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    const trimmed = email.trim();
    start.mutate(trimmed, {
      onSuccess: (result) =>
        result.ok ? onCodeSent(trimmed) : setErrorMessage(SIGN_IN_COPY.reasons[result.reason]),
      onError: () => setErrorMessage(SIGN_IN_COPY.reasons[FailureReason.Unknown]),
    });
  };

  const handlePasskey = () => {
    setErrorMessage(undefined);
    const trimmed = email.trim();
    if (!trimmed.includes(EMAIL_MARKER)) {
      setErrorMessage(SIGN_IN_COPY.passkey.emailRequired);
      return;
    }
    signInWithPasskey.mutate(trimmed, {
      onSuccess: (result) =>
        result.ok ? device.remember(trimmed) : setErrorMessage(SIGN_IN_COPY.reasons[result.reason]),
      onError: () => setErrorMessage(SIGN_IN_COPY.reasons[FailureReason.Unknown]),
    });
  };

  return {
    email,
    setEmail,
    errorMessage,
    passkeysAvailable,
    isSending: start.isPending,
    isPasskeyPending: signInWithPasskey.isPending,
    handleSubmit,
    handlePasskey,
  };
};
