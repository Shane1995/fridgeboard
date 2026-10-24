import { Modal } from '@heroui/react';
import type { UseOverlayStateReturn } from '@heroui/react';
import type { ListItem } from '../../services/shoppingList/types';
import { formatAddedAt } from '../../utils/formatAddedAt';
import { ITEM_INFO_COPY } from './constants';

type ItemInfoDialogProps = { item: ListItem; state: UseOverlayStateReturn };

export const ItemInfoDialog = ({ item, state }: ItemInfoDialogProps) => {
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{item.name}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-1 pb-4">
              {item.addedBy && (
                <p>
                  {ITEM_INFO_COPY.addedBy} <strong>{item.addedBy}</strong>
                </p>
              )}
              <p>
                {ITEM_INFO_COPY.addedOn} {formatAddedAt(item.createdAt)}
              </p>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
