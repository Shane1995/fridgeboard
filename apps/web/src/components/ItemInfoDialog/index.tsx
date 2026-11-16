import { AppDialog } from '../AppDialog';
import type { UseOverlayStateReturn } from '@heroui/react';
import type { ListItem } from '../../services/shoppingList/types';
import { useMemberName } from '../../hooks/useMemberName';
import { formatAddedAt } from '../../utils/formatAddedAt';
import { ITEM_INFO_COPY } from './constants';

type ItemInfoDialogProps = { item: ListItem; state: UseOverlayStateReturn };

export const ItemInfoDialog = ({ item, state }: ItemInfoDialogProps) => {
  const addedBy = useMemberName({ id: item.addedBy, enabled: state.isOpen });
  return (
    <AppDialog state={state} title={item.name}>
      <div className="flex flex-col gap-1 pb-4">
        {addedBy && (
          <p>
            {ITEM_INFO_COPY.addedBy} <strong>{addedBy}</strong>
          </p>
        )}
        <p>
          {ITEM_INFO_COPY.addedOn} {formatAddedAt(item.createdAt)}
        </p>
      </div>
    </AppDialog>
  );
};
