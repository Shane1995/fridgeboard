import { Modal } from '@heroui/react';
import { APP_DIALOG_COPY } from './constants';
import type { AppDialogProps } from './types';

// The one dialog every popup in the app is built from, so each can be closed the same ways: the
// close button, Escape and a tap on the backdrop, and each has the same title and spacing.
export const AppDialog = ({
  state,
  title,
  scroll = 'outside',
  footer,
  children,
}: AppDialogProps) => (
  <Modal state={state}>
    <Modal.Backdrop>
      <Modal.Container placement="auto" scroll={scroll}>
        <Modal.Dialog>
          <Modal.CloseTrigger aria-label={APP_DIALOG_COPY.close} />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          {footer !== undefined && <Modal.Footer>{footer}</Modal.Footer>}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
);
