import { Modal } from '@heroui/react';
import { EventForm } from './components/EventForm';
import { EVENT_DIALOG_COPY } from './constants';
import type { EventDialogProps } from './types';

export const EventDialog = ({ state, event, date, onSave, onDelete }: EventDialogProps) => {
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {event === undefined ? EVENT_DIALOG_COPY.createTitle : EVENT_DIALOG_COPY.editTitle}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <EventForm
                event={event}
                date={date}
                onSave={onSave}
                onDelete={onDelete}
                onDone={state.close}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
