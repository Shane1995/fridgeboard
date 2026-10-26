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
  setShops: (change: { shopIds: string[] }) => void;
  canSplitOut: boolean;
  canSplitAll: boolean;
  duplicateCount: number;
  handleMenuAction: (key: string | number) => void;
};
