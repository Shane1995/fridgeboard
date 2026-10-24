import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { SIGN_IN_COPY } from '../../constants';
import { useEmailStep } from './hooks/useEmailStep';
import type { EmailStepProps } from './types';

export const EmailStep = (props: EmailStepProps) => {
  const {
    email,
    setEmail,
    errorMessage,
    passkeysAvailable,
    isSending,
    isPasskeyPending,
    handleSubmit,
    handlePasskey,
  } = useEmailStep(props);

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
      <Button type="submit" isPending={isSending}>
        {isSending ? SIGN_IN_COPY.sendingCode : SIGN_IN_COPY.sendCode}
      </Button>
      {passkeysAvailable && (
        <Button variant="secondary" onPress={handlePasskey} isPending={isPasskeyPending}>
          {isPasskeyPending ? SIGN_IN_COPY.passkey.signingIn : SIGN_IN_COPY.passkey.submit}
        </Button>
      )}
    </form>
  );
};
