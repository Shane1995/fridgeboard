import { Alert, Button } from '@heroui/react';
import { useState } from 'react';
import { useSignInWithPasskeyMutation } from '../../../../hooks/useSignInWithPasskeyMutation';
import { SIGN_IN_COPY } from '../../constants';
import type { PasskeyStepProps } from './types';

const COPY = SIGN_IN_COPY.passkey;

export const PasskeyStep = ({ email, onFallback }: PasskeyStepProps) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const signIn = useSignInWithPasskeyMutation();

  const handleSignIn = () => {
    setErrorMessage(undefined);
    signIn.mutate(email, {
      onSuccess: (result) => {
        if (result.ok) {
          return;
        }
        if (result.reason === 'fallback') {
          onFallback();
        } else if (result.reason === 'cancelled') {
          setErrorMessage(COPY.cancelled);
        } else {
          setErrorMessage(SIGN_IN_COPY.reasons[result.reason]);
        }
      },
      onError: () => setErrorMessage(SIGN_IN_COPY.reasons.unknown),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{COPY.title}</h2>
      <p>
        {COPY.intro} <strong>{email}</strong>
      </p>
      {errorMessage && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button onPress={handleSignIn} isPending={signIn.isPending}>
        {signIn.isPending ? COPY.signingIn : COPY.submit}
      </Button>
      <Button variant="ghost" onPress={onFallback}>
        {COPY.useCode}
      </Button>
    </div>
  );
};
