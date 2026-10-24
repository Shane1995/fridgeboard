import type { FormEvent } from 'react';

export type UsernameStepState = {
  username: string;
  setUsername: (username: string) => void;
  errorMessage: string | undefined;
  isSaving: boolean;
  minLength: number;
  maxLength: number;
  handleSubmit: (event: Pick<FormEvent, 'preventDefault'>) => void;
};
