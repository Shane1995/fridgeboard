import type { UseOverlayStateReturn } from '@heroui/react';

export type ImportDialogProps = {
  state: UseOverlayStateReturn;
  onImport: (options: { source: string }) => void;
};
