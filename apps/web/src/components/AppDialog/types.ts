import type { UseOverlayStateReturn } from '@heroui/react';
import type { ReactNode } from 'react';

export type AppDialogProps = {
  state: UseOverlayStateReturn;
  title: ReactNode;
  scroll?: 'inside' | 'outside';
  footer?: ReactNode;
  children: ReactNode;
};
