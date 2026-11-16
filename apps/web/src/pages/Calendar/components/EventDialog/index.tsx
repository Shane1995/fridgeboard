import { AppDialog } from '../../../../components/AppDialog';
import { EventForm } from './components/EventForm';
import { EVENT_DIALOG_COPY } from './constants';
import type { EventDialogProps } from './types';

export const EventDialog = ({ state, event, date, onSave, onDelete }: EventDialogProps) => {
  return (
    <AppDialog
      state={state}
      title={event === undefined ? EVENT_DIALOG_COPY.createTitle : EVENT_DIALOG_COPY.editTitle}
    >
      <EventForm
        event={event}
        date={date}
        onSave={onSave}
        onDelete={onDelete}
        onDone={state.close}
      />
    </AppDialog>
  );
};
