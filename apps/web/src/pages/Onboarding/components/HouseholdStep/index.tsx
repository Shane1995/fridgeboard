import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import {
  DEFAULT_HOUSEHOLD_NAME,
  HOUSEHOLD_NAME_MAX_LENGTH,
} from '@fridgeboard/contract/households/constants';
import { useState, type FormEvent } from 'react';
import { useCreateHouseholdMutation } from '../../../../hooks/useCreateHouseholdMutation';
import { ONBOARDING_COPY } from '../../constants';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';

const COPY = ONBOARDING_COPY.household;

export const HouseholdStep = () => {
  const [name, setName] = useState(DEFAULT_HOUSEHOLD_NAME);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const create = useCreateHouseholdMutation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    create.mutate(name.trim(), {
      onSuccess: (result) => !result.ok && setErrorMessage(COPY.reasons[result.reason]),
      onError: () => setErrorMessage(COPY.reasons.unknown),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant={TypographyVariant.Heading2}>{COPY.title}</Typography>
      <Typography>{COPY.intro}</Typography>
      <TextField
        name="household"
        isRequired
        maxLength={HOUSEHOLD_NAME_MAX_LENGTH}
        value={name}
        onChange={setName}
      >
        <Label>{COPY.label}</Label>
        <Input />
      </TextField>
      {errorMessage && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" isPending={create.isPending}>
        {create.isPending ? COPY.saving : COPY.submit}
      </Button>
    </form>
  );
};
