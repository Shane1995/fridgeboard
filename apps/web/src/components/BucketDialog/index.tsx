import { Modal } from '@heroui/react';
import type { UseOverlayStateReturn } from '@heroui/react';
import type { Bucket } from '../../services/shoppingList/types';
import { BucketForm } from './components/BucketForm';
import { BUCKET_DIALOG_COPY } from './constants';

type BucketDialogProps = { state: UseOverlayStateReturn; bucket?: Bucket | undefined };

export const BucketDialog = ({ state, bucket }: BucketDialogProps) => {
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {bucket === undefined
                  ? BUCKET_DIALOG_COPY.createTitle
                  : BUCKET_DIALOG_COPY.editTitle}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <BucketForm bucket={bucket} onDone={state.close} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
