import { Button, Modal } from '@heroui/react';
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
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{description}</p>
            </Modal.Body>
            <Modal.Footer>
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
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
