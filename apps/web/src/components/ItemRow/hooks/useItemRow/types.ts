import type { UseOverlayStateReturn } from '@heroui/react';
import type { FormEvent } from 'react';

export type ItemRowState = {
  infoDialog: UseOverlayStateReturn;
  isEditing: boolean;
  draft: string;
  setDraft: (draft: string) => void;
  startEditing: () => void;
  commit: (event?: FormEvent) => void;
  cancel: () => void;
  toggle: (checked: boolean) => void;
  handleMenuAction: (key: string | number) => void;
};
