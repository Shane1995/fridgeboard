import type { FormEvent } from 'react';

export type InviteFeedback = { kind: 'success' | 'error'; message: string };

export type InviteFormState = {
  email: string;
  setEmail: (email: string) => void;
  feedback: InviteFeedback | undefined;
  isSending: boolean;
  handleSubmit: (event: Pick<FormEvent, 'preventDefault'>) => void;
};
