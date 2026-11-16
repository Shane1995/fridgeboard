import { AppDialog } from '../AppDialog';
import { Button } from '@heroui/react';
import { HoldToConfirmButton } from './components/HoldToConfirmButton';
import { CONFIRM_DIALOG_COPY } from './constants';
import type { ConfirmDialogProps } from './types';

export const ConfirmDialog = ({
  state,
  title,
  description,
  confirmLabel,
  onConfirm,
  holdToConfirm = false,
}: ConfirmDialogProps) => {
  const confirm = () => {
    onConfirm();
    state.close();
  };

  return (
    <AppDialog
      state={state}
      title={title}
      footer={
        <>
          <Button autoFocus variant="secondary" onPress={state.close}>
            {CONFIRM_DIALOG_COPY.cancel}
          </Button>
          {holdToConfirm ? (
            <HoldToConfirmButton onComplete={confirm}>{confirmLabel}</HoldToConfirmButton>
          ) : (
            <Button variant="danger" onPress={confirm}>
              {confirmLabel}
            </Button>
          )}
        </>
      }
    >
      <p>{description}</p>
    </AppDialog>
  );
};
