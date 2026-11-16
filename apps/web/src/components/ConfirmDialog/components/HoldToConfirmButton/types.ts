import type { PropsWithChildren } from 'react';

export type HoldToConfirmButtonProps = PropsWithChildren<{
  onComplete: () => void;
}>;
