import type { FormEvent } from 'react';

export type EmailStepState = {
  email: string;
  setEmail: (email: string) => void;
  errorMessage: string | undefined;
  passkeysAvailable: boolean;
  isSending: boolean;
  isPasskeyPending: boolean;
  handleSubmit: (event: Pick<FormEvent, 'preventDefault'>) => void;
  handlePasskey: () => void;
};
