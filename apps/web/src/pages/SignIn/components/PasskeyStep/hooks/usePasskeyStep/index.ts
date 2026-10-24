import { useState } from 'react';
import { useSignInWithPasskeyMutation } from '../../../../../../hooks/useSignInWithPasskeyMutation';
import { FailureReason } from '../../../../../../services/session/constants';
import { SIGN_IN_COPY } from '../../../../constants';
import type { PasskeyStepProps } from '../../types';
import type { PasskeyStepState } from './types';

export const usePasskeyStep = ({ email, onFallback }: PasskeyStepProps): PasskeyStepState => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const signIn = useSignInWithPasskeyMutation();

  const handleSignIn = () => {
    setErrorMessage(undefined);
    signIn.mutate(email, {
      onSuccess: (result) => {
        if (result.ok) {
          return;
        }
        if (result.reason === FailureReason.Fallback) {
          onFallback();
        } else {
          setErrorMessage(SIGN_IN_COPY.reasons[result.reason]);
        }
      },
      onError: () => setErrorMessage(SIGN_IN_COPY.reasons[FailureReason.Unknown]),
    });
  };

  return { errorMessage, isPending: signIn.isPending, handleSignIn };
};
