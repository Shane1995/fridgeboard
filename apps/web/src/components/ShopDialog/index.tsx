import { AppDialog } from '../AppDialog';
import type { UseOverlayStateReturn } from '@heroui/react';
import type { Shop } from '../../services/shoppingList/types';
import { ShopForm } from './components/ShopForm';
import { SHOP_DIALOG_COPY } from './constants';

type ShopDialogProps = { state: UseOverlayStateReturn; shop?: Shop | undefined };

export const ShopDialog = ({ state, shop }: ShopDialogProps) => {
  return (
    <AppDialog
      state={state}
      title={shop === undefined ? SHOP_DIALOG_COPY.createTitle : SHOP_DIALOG_COPY.editTitle}
    >
      <ShopForm shop={shop} onDone={state.close} />
    </AppDialog>
  );
};
