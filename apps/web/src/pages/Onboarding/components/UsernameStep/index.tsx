import { Alert, Button, Description, Input, Label, TextField } from '@heroui/react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { ONBOARDING_COPY } from '../../constants';
import { useUsernameStep } from './hooks/useUsernameStep';

const COPY = ONBOARDING_COPY.username;

export const UsernameStep = () => {
  const { username, setUsername, errorMessage, isSaving, minLength, maxLength, handleSubmit } =
    useUsernameStep();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{COPY.title}</Typography>
      <Typography>{COPY.intro}</Typography>
      <TextField
        name="username"
        autoComplete="username"
        isRequired
        maxLength={maxLength}
        value={username}
        onChange={setUsername}
      >
        <Label>{COPY.label}</Label>
        <Input autoCapitalize="none" />
        <Description>{COPY.hint(minLength, maxLength)}</Description>
      </TextField>
      {errorMessage && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" isPending={isSaving}>
        {isSaving ? COPY.saving : COPY.submit}
      </Button>
    </form>
  );
};
