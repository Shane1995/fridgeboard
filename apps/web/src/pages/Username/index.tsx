import { Alert, Button, Description, Input, Label, TextField } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { useSetUsernameMutation } from '../../hooks/useSetUsernameMutation';
import { USERNAME_COPY } from './constants';

export const Username = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const save = useSetUsernameMutation();
  const { usernameMinLength, usernameMaxLength } = useRemoteConfigContext().settings;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    save.mutate(username.trim(), {
      onSuccess: (result) =>
        result.ok
          ? void navigate({ to: '/', replace: true })
          : setErrorMessage(USERNAME_COPY.reasons[result.reason]),
      onError: () => setErrorMessage(USERNAME_COPY.reasons.unknown),
    });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{USERNAME_COPY.title}</h1>
        <p>{USERNAME_COPY.intro}</p>
        <TextField
          name="username"
          autoComplete="username"
          isRequired
          maxLength={usernameMaxLength}
          value={username}
          onChange={setUsername}
        >
          <Label>{USERNAME_COPY.label}</Label>
          <Input autoCapitalize="none" />
          <Description>{USERNAME_COPY.hint(usernameMinLength, usernameMaxLength)}</Description>
        </TextField>
        {errorMessage && (
          <Alert status="danger">
            <Alert.Content>
              <Alert.Description>{errorMessage}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        <Button type="submit" isPending={save.isPending}>
          {save.isPending ? USERNAME_COPY.saving : USERNAME_COPY.submit}
        </Button>
      </form>
    </main>
  );
};
