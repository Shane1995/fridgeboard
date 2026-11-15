import type { UseOverlayStateReturn } from '@heroui/react';

export type ConfirmDialogProps = {
  state: UseOverlayStateReturn;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  holdToConfirm?: boolean | undefined;
};
