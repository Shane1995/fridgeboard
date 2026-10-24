import type { FormEvent } from 'react';

export type HouseholdStepState = {
  name: string;
  setName: (name: string) => void;
  errorMessage: string | undefined;
  isCreating: boolean;
  handleSubmit: (event: Pick<FormEvent, 'preventDefault'>) => void;
};
