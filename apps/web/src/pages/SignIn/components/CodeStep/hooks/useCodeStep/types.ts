import type { FormEvent } from 'react';
import type { CodeFeedback } from '../../types';

export type CodeStepState = {
  code: string;
  setCode: (code: string) => void;
  feedback: CodeFeedback | undefined;
  isVerifying: boolean;
  isResending: boolean;
  handleSubmit: (event: Pick<FormEvent, 'preventDefault'>) => void;
  handleResend: () => void;
};
