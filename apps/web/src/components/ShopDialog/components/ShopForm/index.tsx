import { Button, Input, Label, TextField, useOverlayState } from '@heroui/react';
import { SHOP_NAME_MAX_LENGTH } from '../../../../services/shoppingList/constants';
import type { Shop } from '../../../../services/shoppingList/types';
import { ColorPicker } from '../../../ColorPicker';
import { ConfirmDialog } from '../../../ConfirmDialog';
import { SHOP_FORM_COPY } from './constants';
import { useShopForm } from './hooks/useShopForm';

type ShopFormProps = { shop?: Shop | undefined; onDone: () => void };

export const ShopForm = ({ shop, onDone }: ShopFormProps) => {
  const { name, setName, color, setColor, isSaving, isDeleting, handleSubmit, handleDelete } =
    useShopForm(shop, onDone);
  const confirmDelete = useOverlayState();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <TextField
        isRequired
        autoFocus
        maxLength={SHOP_NAME_MAX_LENGTH}
        value={name}
        onChange={setName}
      >
        <Label>{SHOP_FORM_COPY.nameLabel}</Label>
        <Input />
      </TextField>
      <ColorPicker label={SHOP_FORM_COPY.colorLabel} value={color} onChange={setColor} />
      <Button type="submit" fullWidth isPending={isSaving}>
        {shop === undefined ? SHOP_FORM_COPY.create : SHOP_FORM_COPY.save}
      </Button>
      {shop !== undefined && (
        <>
          <Button
            variant="danger-soft"
            fullWidth
            onPress={confirmDelete.open}
            isPending={isDeleting}
          >
            {SHOP_FORM_COPY.delete}
          </Button>
          <ConfirmDialog
            state={confirmDelete}
            title={SHOP_FORM_COPY.confirmTitle(shop.name)}
            description={SHOP_FORM_COPY.confirmDescription}
            confirmLabel={SHOP_FORM_COPY.confirm}
            onConfirm={handleDelete}
          />
        </>
      )}
    </form>
  );
};
