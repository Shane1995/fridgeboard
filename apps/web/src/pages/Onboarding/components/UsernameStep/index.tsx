import { Alert, Button, Description, Input, Label, TextField } from '@heroui/react';
import { useState, type FormEvent } from 'react';
import { useRemoteConfigContext } from '../../../../hooks/useRemoteConfigContext';
import { useSetUsernameMutation } from '../../../../hooks/useSetUsernameMutation';
import { ONBOARDING_COPY } from '../../constants';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';

const COPY = ONBOARDING_COPY.username;

export const UsernameStep = () => {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const save = useSetUsernameMutation();
  const { usernameMinLength, usernameMaxLength } = useRemoteConfigContext().settings;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    save.mutate(username.trim(), {
      onSuccess: (result) => !result.ok && setErrorMessage(COPY.reasons[result.reason]),
      onError: () => setErrorMessage(COPY.reasons.unknown),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{COPY.title}</Typography>
      <Typography>{COPY.intro}</Typography>
      <TextField
        name="username"
        autoComplete="username"
        isRequired
        maxLength={usernameMaxLength}
        value={username}
        onChange={setUsername}
      >
        <Label>{COPY.label}</Label>
        <Input autoCapitalize="none" />
        <Description>{COPY.hint(usernameMinLength, usernameMaxLength)}</Description>
      </TextField>
      {errorMessage && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" isPending={save.isPending}>
        {save.isPending ? COPY.saving : COPY.submit}
      </Button>
    </form>
  );
};
