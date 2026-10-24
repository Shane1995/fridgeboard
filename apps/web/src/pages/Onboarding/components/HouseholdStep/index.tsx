import { Alert, Button, Input, Label, TextField } from '@heroui/react';
import { HOUSEHOLD_NAME_MAX_LENGTH } from '@fridgeboard/contract/households/constants';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { ONBOARDING_COPY } from '../../constants';
import { useHouseholdStep } from './hooks/useHouseholdStep';

const COPY = ONBOARDING_COPY.household;

export const HouseholdStep = () => {
  const { name, setName, errorMessage, isCreating, handleSubmit } = useHouseholdStep();

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
      <Button type="submit" isPending={isCreating}>
        {isCreating ? COPY.saving : COPY.submit}
      </Button>
    </form>
  );
};
