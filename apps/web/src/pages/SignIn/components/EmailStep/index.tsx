import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { useStartSignInMutation } from '../../../../hooks/useStartSignInMutation';
import { SIGN_IN_COPY } from '../../constants';
import type { EmailStepProps } from './types';

export const EmailStep = ({ initialEmail, onCodeSent }: EmailStepProps) => {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const start = useStartSignInMutation();

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{SIGN_IN_COPY.emailTitle}</h2>
      <p>{SIGN_IN_COPY.emailIntro}</p>
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
    </form>
  );
};
