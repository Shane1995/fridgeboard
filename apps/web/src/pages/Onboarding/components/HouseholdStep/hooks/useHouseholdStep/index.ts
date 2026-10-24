import { DEFAULT_HOUSEHOLD_NAME } from '@fridgeboard/contract/households/constants';
import { useState, type FormEvent } from 'react';
import { useCreateHouseholdMutation } from '../../../../../../hooks/useCreateHouseholdMutation';
import { FailureReason } from '../../../../../../services/session/constants';
import { ONBOARDING_COPY } from '../../../../constants';
import type { HouseholdStepState } from './types';

const COPY = ONBOARDING_COPY.household;

export const useHouseholdStep = (): HouseholdStepState => {
  const [name, setName] = useState(DEFAULT_HOUSEHOLD_NAME);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const create = useCreateHouseholdMutation();

  const handleSubmit = (event: Pick<FormEvent, 'preventDefault'>) => {
    event.preventDefault();
    setErrorMessage(undefined);
    create.mutate(name.trim(), {
      onSuccess: (result) => !result.ok && setErrorMessage(COPY.reasons[result.reason]),
      onError: () => setErrorMessage(COPY.reasons[FailureReason.Unknown]),
    });
  };

  return { name, setName, errorMessage, isCreating: create.isPending, handleSubmit };
};
