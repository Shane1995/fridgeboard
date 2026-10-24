import { Modal } from '@heroui/react';
import type { UseOverlayStateReturn } from '@heroui/react';
import type { Shop } from '../../services/shoppingList/types';
import { ShopForm } from './components/ShopForm';
import { SHOP_DIALOG_COPY } from './constants';

type ShopDialogProps = { state: UseOverlayStateReturn; shop?: Shop | undefined };

export const ShopDialog = ({ state, shop }: ShopDialogProps) => {
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                {shop === undefined ? SHOP_DIALOG_COPY.createTitle : SHOP_DIALOG_COPY.editTitle}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <ShopForm shop={shop} onDone={state.close} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
