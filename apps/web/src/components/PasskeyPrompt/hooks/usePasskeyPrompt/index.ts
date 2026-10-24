import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { useMeQuery } from '../../../../hooks/useMeQuery';
import { usePasskeyDevice } from '../../../../hooks/usePasskeyDevice';
import { useRegisterPasskeyMutation } from '../../../../hooks/useRegisterPasskeyMutation';
import { useSessionContext } from '../../../../hooks/useSessionContext';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { FailureReason } from '../../../../services/session/constants';
import { SIGN_IN_COPY } from '../../../../pages/SignIn/constants';
import { CONFIRMATION_MS, PASSKEY_PROMPT_COPY as COPY } from '../../constants';
import type { PasskeyPromptState } from './types';

export const usePasskeyPrompt = (): PasskeyPromptState => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_PASSKEYS);
  const { recentCodeSignIn } = useSessionContext();
  const { data: me } = useMeQuery();
  const device = usePasskeyDevice();
  const register = useRegisterPasskeyMutation();
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const email = me?.email;
  const eligible =
    enabled &&
    recentCodeSignIn &&
    email !== undefined &&
    !device.promptDismissed &&
    device.email !== email &&
    browserSupportsWebAuthn();

  const handleSetUp = () => {
    setMessage(undefined);
    register.mutate(undefined, {
      onSuccess: (result) => {
        if (result.ok) {
          if (email !== undefined) {
            device.remember(email);
          }
          setDone(true);
          setTimeout(() => setHidden(true), CONFIRMATION_MS);
        } else if (result.reason === FailureReason.Cancelled) {
          setMessage(COPY.cancelled);
        } else {
          setMessage(SIGN_IN_COPY.reasons[result.reason]);
        }
      },
      onError: () => setMessage(SIGN_IN_COPY.reasons[FailureReason.Unknown]),
    });
  };

  const handleNotNow = () => setHidden(true);

  const handleDontAsk = () => {
    device.dismissPrompt();
    setHidden(true);
  };

  return {
    visible: !hidden && (eligible || done),
    done,
    message,
    isPending: register.isPending,
    handleSetUp,
    handleNotNow,
    handleDontAsk,
  };
};
