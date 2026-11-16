import { AppDialog } from '../../../../components/AppDialog';
import { AddToListForm } from './components/AddToListForm';
import { ADD_TO_LIST_COPY } from './constants';
import type { AddToListDialogProps } from './types';

export const AddToListDialog = ({ state, recipe }: AddToListDialogProps) => {
  return (
    <AppDialog
      state={state}
      title={
        <>
          {ADD_TO_LIST_COPY.title}: {recipe.name}
        </>
      }
      scroll="inside"
    >
      <AddToListForm recipe={recipe} onDone={state.close} />
    </AppDialog>
  );
};
