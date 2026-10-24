import { Alert, Button } from '@heroui/react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { SIGN_IN_COPY } from '../../constants';
import { usePasskeyStep } from './hooks/usePasskeyStep';
import type { PasskeyStepProps } from './types';

const COPY = SIGN_IN_COPY.passkey;

export const PasskeyStep = ({ email, onFallback }: PasskeyStepProps) => {
  const { errorMessage, isPending, handleSignIn } = usePasskeyStep({ email, onFallback });

  return (
    <div className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{COPY.title}</Typography>
      <Typography>
        {COPY.intro} <Typography variant={TypographyVariant.Strong}>{email}</Typography>
      </Typography>
      {errorMessage && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button onPress={handleSignIn} isPending={isPending}>
        {isPending ? COPY.signingIn : COPY.submit}
      </Button>
      <Button variant="ghost" onPress={onFallback}>
        {COPY.useCode}
      </Button>
    </div>
  );
};
