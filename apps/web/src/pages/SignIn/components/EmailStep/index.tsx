import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState, type FormEvent } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { usePasskeyDevice } from '../../../../hooks/usePasskeyDevice';
import { useSignInWithPasskeyMutation } from '../../../../hooks/useSignInWithPasskeyMutation';
import { useStartSignInMutation } from '../../../../hooks/useStartSignInMutation';
import { EMAIL_MARKER, SIGN_IN_COPY } from '../../constants';
import type { EmailStepProps } from './types';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';

export const EmailStep = ({ initialEmail, onCodeSent }: EmailStepProps) => {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const start = useStartSignInMutation();
  const signInWithPasskey = useSignInWithPasskeyMutation();
  const device = usePasskeyDevice();
  const passkeysAvailable =
    useFeatureFlag(WebFeatureFlag.ENABLE_PASSKEYS) && browserSupportsWebAuthn();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    const trimmed = email.trim();
    start.mutate(trimmed, {
      onSuccess: (result) =>
        result.ok ? onCodeSent(trimmed) : setErrorMessage(SIGN_IN_COPY.reasons[result.reason]),
      onError: () => setErrorMessage(SIGN_IN_COPY.reasons.unknown),
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
      onError: () => setErrorMessage(SIGN_IN_COPY.reasons.unknown),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{SIGN_IN_COPY.emailTitle}</Typography>
      <Typography>{SIGN_IN_COPY.emailIntro}</Typography>
      <TextField
        name="email"
        type="email"
        autoComplete="email"
        isRequired
        value={email}
        onChange={setEmail}
      >
        <Label>{SIGN_IN_COPY.emailLabel}</Label>
        <Input />
      </TextField>
      {errorMessage && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" isPending={start.isPending}>
        {start.isPending ? SIGN_IN_COPY.sendingCode : SIGN_IN_COPY.sendCode}
      </Button>
      {passkeysAvailable && (
        <Button variant="secondary" onPress={handlePasskey} isPending={signInWithPasskey.isPending}>
          {signInWithPasskey.isPending
            ? SIGN_IN_COPY.passkey.signingIn
            : SIGN_IN_COPY.passkey.submit}
        </Button>
      )}
    </form>
  );
};
