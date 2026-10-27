import { Modal } from '@heroui/react';
import { AddToListForm } from './components/AddToListForm';
import { ADD_TO_LIST_COPY } from './constants';
import type { AddToListDialogProps } from './types';

export const AddToListDialog = ({ state, recipe }: AddToListDialogProps) => {
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {ADD_TO_LIST_COPY.title}: {recipe.name}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <AddToListForm recipe={recipe} onDone={state.close} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
