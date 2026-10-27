import type { UseOverlayStateReturn } from '@heroui/react';

export type IdeasDialogProps = {
  state: UseOverlayStateReturn;
  onImport: (options: { source: string }) => void;
};
