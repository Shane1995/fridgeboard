import type { FormEvent, KeyboardEvent } from 'react';

export type QuickAddState = {
  isOpen: boolean;
  name: string;
  open: () => void;
  close: () => void;
  setName: (value: string) => void;
  handleSubmit: (event: FormEvent) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};
