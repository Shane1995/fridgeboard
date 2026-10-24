import type { FormEvent } from 'react';
import type { ShopColor } from '../../../../../../services/shoppingList/constants';

export type ShopFormState = {
  name: string;
  setName: (name: string) => void;
  color: ShopColor;
  setColor: (color: ShopColor) => void;
  isSaving: boolean;
  isDeleting: boolean;
  handleDelete: () => void;
  handleSubmit: (event: FormEvent) => void;
};
