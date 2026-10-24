import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { usePasskeyDevice } from '../../../../hooks/usePasskeyDevice';
import { useSessionContext } from '../../../../hooks/useSessionContext';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { SessionStatus } from '../../../../services/session/constants';
import type { SignInProps } from '../../types';
import type { SignInState } from './types';

export const useSignIn = ({
  initialEmail,
  redirectTo,
}: Pick<SignInProps, 'initialEmail' | 'redirectTo'>): SignInState => {
  const router = useRouter();
  const [codeEmail, setCodeEmail] = useState<string | undefined>();
  const { status } = useSessionContext();
  const signedIn = status === SessionStatus.SignedIn;
  const passkeysEnabled = useFeatureFlag(WebFeatureFlag.ENABLE_PASSKEYS);
  const device = usePasskeyDevice();
  const [preferCode, setPreferCode] = useState(false);
  const passkeyEmail =
    passkeysEnabled && !preferCode && browserSupportsWebAuthn() ? device.email : undefined;

  useEffect(() => {
    if (signedIn) {
      router.history.replace(redirectTo);
    }
  }, [signedIn, router, redirectTo]);

  return {
    loading: status === SessionStatus.Loading || signedIn,
    codeEmail,
    passkeyEmail,
    emailStepInitialEmail: initialEmail ?? device.email,
    handleCodeSent: setCodeEmail,
    handleBack: () => setCodeEmail(undefined),
    handleSignedIn: () => router.history.push(redirectTo),
    handlePasskeyFallback: () => setPreferCode(true),
  };
};
