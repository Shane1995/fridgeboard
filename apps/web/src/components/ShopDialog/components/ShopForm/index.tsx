import { Button, Input, Label, TextField } from '@heroui/react';
import { SHOP_NAME_MAX_LENGTH, ShopColor } from '../../../../services/shoppingList/constants';
import type { Shop } from '../../../../services/shoppingList/types';
import { ShopSwatch } from '../../../ShopSwatch';
import { SHOP_FORM_COPY } from './constants';
import { useShopForm } from './hooks/useShopForm';

type ShopFormProps = { shop?: Shop | undefined; onDone: () => void };

export const ShopForm = ({ shop, onDone }: ShopFormProps) => {
  const { name, setName, color, setColor, isSaving, isDeleting, handleSubmit, handleDelete } =
    useShopForm(shop, onDone);

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
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{SHOP_FORM_COPY.colorLabel}</span>
        <div role="group" aria-label={SHOP_FORM_COPY.colorLabel} className="flex flex-wrap gap-3">
          {Object.values(ShopColor).map((option) => (
            <button
              key={option}
              type="button"
              aria-label={option}
              aria-pressed={option === color}
              onClick={() => setColor(option)}
              className="cursor-pointer rounded-full p-1 outline-none transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2"
            >
              <ShopSwatch color={option} size="lg" />
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" fullWidth isPending={isSaving}>
        {shop === undefined ? SHOP_FORM_COPY.create : SHOP_FORM_COPY.save}
      </Button>
      {shop !== undefined && (
        <Button variant="danger-soft" fullWidth onPress={handleDelete} isPending={isDeleting}>
          {SHOP_FORM_COPY.delete}
        </Button>
      )}
    </form>
  );
};
